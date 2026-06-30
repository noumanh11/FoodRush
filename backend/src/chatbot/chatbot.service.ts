import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Groq from 'groq-sdk';
import { MenusService } from '../menus/menus.service';
import { MenuItem } from '../restaurants/menu-item.entity';
import { ChatConversation } from './chat-conversation.entity';
import { ChatMessageEntity } from './chat-message.entity';

const GROQ_MODEL = 'llama-3.1-8b-instant';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly groq: Groq | null;

  constructor(
    private readonly config: ConfigService,
    private readonly menusService: MenusService,
    @InjectRepository(ChatConversation)
    private readonly conversationRepo: Repository<ChatConversation>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,
  ) {
    const apiKey = config.get<string>('GROQ_API_KEY');
    const isPlaceholder =
      !apiKey ||
      apiKey === 'your_groq_api_key_here' ||
      apiKey.trim().length < 10;

    if (isPlaceholder) {
      this.groq = null;
      this.logger.warn(
        'GROQ_API_KEY not configured — chatbot will use local menu search only',
      );
    } else {
      this.groq = new Groq({
        apiKey,
        baseURL: 'https://api.groq.com',
        fetch: global.fetch,
      });
    }
  }

  async chat(message: string, history?: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
    const offTopicPatterns = [
      /complain/i, /complaint/i, /refund/i, /payment/i, /pay/i,
      /cancel.*order/i, /track.*order/i, /order.*status/i,
      /weather/i, /news/i, /joke/i, /sports/i,
    ];

    if (offTopicPatterns.some((p) => p.test(message))) {
      return 'I can only help with food discovery — finding dishes and restaurants. For order issues, please use the orders section of the app.';
    }

    const menuItems = await this.menusService.findAllForChatbot();

    if (menuItems.length === 0) {
      return 'No menu items are available yet. Please check back once restaurants have added their menus!';
    }

    // 1. Contextual Pre-Filtering: Extract keywords from user message to get the most relevant items
    const terms = message
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    let filteredItems = menuItems;
    if (terms.length > 0) {
      const scored = menuItems.map((item) => {
        const name = item.name.toLowerCase();
        const category = (item.category || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        const restaurant = (item.restaurant?.name || '').toLowerCase();
        const cuisine = (item.restaurant?.cuisine || '').toLowerCase();

        let score = 0;
        for (const term of terms) {
          if (name.includes(term)) score += 3;
          if (category.includes(term)) score += 2;
          if (description.includes(term)) score += 2;
          if (restaurant.includes(term)) score += 2;
          if (cuisine.includes(term)) score += 1;
        }
        return { item, score };
      });

      const matches = scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((s) => s.item);

      if (matches.length > 0) {
        filteredItems = matches.slice(0, 15);
      } else {
        // Fallback: If no direct matches, send the first 15 items
        filteredItems = menuItems.slice(0, 15);
      }
    } else {
      filteredItems = menuItems.slice(0, 15);
    }

    if (!this.groq) {
      return this.localFoodSearch(message, filteredItems);
    }

    try {
      return await this.groqChatWithRetry(message, history || [], filteredItems);
    } catch (error) {
      this.logGroqError(error);
      return this.localFoodSearch(message, filteredItems);
    }
  }

  private logGroqError(error: any) {
    if (error && error.status) {
      const statusCode = error.status;
      const apiErrorMessage = error.error?.message || error.message || 'Unknown API Error';
      this.logger.error(
        `Groq API Error [Status ${statusCode}]: ${apiErrorMessage}`
      );
    } else {
      this.logger.error(
        `Groq Connection Error: ${error?.message || error}`
      );
    }
  }

  private async groqChatWithRetry(
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    menuItems: MenuItem[],
    retries = 2,
    delayMs = 300,
  ): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.groqChat(message, history, menuItems);
      } catch (error: any) {
        if (attempt === retries) {
          throw error;
        }
        this.logger.warn(`Groq API attempt ${attempt} failed: ${error.message}. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    return '';
  }

  private async groqChat(
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    menuItems: MenuItem[],
  ): Promise<string> {
    const menuContext = this.buildMenuContext(menuItems);

    const systemPrompt = `You are "Foodie Chef", a warm, enthusiastic culinary guide for a food ordering platform.
Your ONLY job is to help users find dishes and restaurants. Describe textures, spices, and flavors in an appealing, gourmet way. Be polite and use emojis.

Guidelines:
- Recommend ONLY dishes and restaurants from the current menu data below.
- NEVER discuss order cancellations, refunds, payments, complaints, or off-topic items. Politely redirect to menu items.
- If a dish is not in the data below, say you don't have it but suggest similar alternatives from the data.
- Be concise (keep answers under 3-4 sentences when possible).

Current Available Menu Data:
${menuContext}`;

    // Construct messages array interweaving system prompt, past dialogue turns, and current query
    const formattedMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const completion = await this.groq!.chat.completions.create({
      model: GROQ_MODEL,
      messages: formattedMessages,
      max_tokens: 300,
      temperature: 0.3,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return this.localFoodSearch(message, menuItems);
    }
    return reply;
  }

  private buildMenuContext(menuItems: MenuItem[]): string {
    return menuItems
      .map((item) => {
        const restaurantName = item.restaurant?.name ?? 'Unknown Restaurant';
        return `- ${item.name} (${item.category || 'General'}) at ${restaurantName}: PKR ${item.price}${item.description ? ` — ${item.description}` : ''}`;
      })
      .join('\n');
  }

  private levenshteinDistance(a: string, b: string): number {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) {
      tmp[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
      tmp[0][j] = j;
    }
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1,
          tmp[i][j - 1] + 1,
          tmp[i - 1][j - 1] + (a[i - 1] === b[i - 1] ? 0 : 1)
        );
      }
    }
    return tmp[a.length][b.length];
  }

  private stemWord(word: string): string {
    const w = word.trim().toLowerCase();
    if (w.endsWith('ies')) {
      return w.slice(0, -3) + 'y';
    }
    if (w.endsWith('es') && !w.endsWith('aes') && !w.endsWith('ees') && !w.endsWith('oes')) {
      return w.slice(0, -2);
    }
    if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && !w.endsWith('is')) {
      return w.slice(0, -1);
    }
    return w;
  }

  private localFoodSearch(message: string, menuItems: MenuItem[]): string {
    const rawTerms = message
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const stemmedTerms = rawTerms.map(t => this.stemWord(t));

    const scored = menuItems.map((item) => {
      const name = item.name.toLowerCase();
      const category = (item.category || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      const restaurant = (item.restaurant?.name || '').toLowerCase();
      const cuisine = (item.restaurant?.cuisine || '').toLowerCase();

      const getWords = (str: string) => str.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
      
      const nameWords = getWords(name).map(w => this.stemWord(w));
      const catWords = getWords(category).map(w => this.stemWord(w));
      const descWords = getWords(description).map(w => this.stemWord(w));
      const restWords = getWords(restaurant).map(w => this.stemWord(w));
      const cuisWords = getWords(cuisine).map(w => this.stemWord(w));

      let score = 0;

      for (let i = 0; i < rawTerms.length; i++) {
        const rawTerm = rawTerms[i];
        const stemmedTerm = stemmedTerms[i];

        // 1. Exact or substring matching
        if (name.includes(rawTerm)) score += 3.5;
        if (category.includes(rawTerm)) score += 2.5;
        if (description.includes(rawTerm)) score += 2.0;
        if (restaurant.includes(rawTerm)) score += 2.5;
        if (cuisine.includes(rawTerm)) score += 1.5;

        // 2. Stemmed matching (singular / plural variations)
        const checkStemmedMatch = (wordsList: string[], weight: number) => {
          if (wordsList.includes(stemmedTerm)) score += weight;
        };

        checkStemmedMatch(nameWords, 2.0);
        checkStemmedMatch(catWords, 1.5);
        checkStemmedMatch(descWords, 1.0);
        checkStemmedMatch(restWords, 1.5);
        checkStemmedMatch(cuisWords, 1.0);

        // 3. Fuzzy matching using Levenshtein distance
        const checkFuzzyMatch = (wordsList: string[], weight: number) => {
          for (const word of wordsList) {
            if (rawTerm.length >= 4 && word.length >= 4) {
              const distance = this.levenshteinDistance(rawTerm, word);
              if (distance === 1) {
                score += weight;
                break;
              } else if (distance === 2) {
                score += weight * 0.5;
                break;
              }
            }
          }
        };

        checkFuzzyMatch(nameWords, 1.5);
        checkFuzzyMatch(restWords, 1.0);
      }

      return { item, score };
    });

    const matches = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((s) => s.item);

    if (matches.length === 0) {
      const samples = menuItems.slice(0, 4);
      const suggestions = samples
        .map(
          (i) =>
            `• ${i.name} at ${i.restaurant?.name ?? 'a restaurant'} (PKR ${i.price})`,
        )
        .join('\n');
      return `I couldn't find an exact match for "${message}". Here are some popular options:\n\n${suggestions}\n\nTry asking about a specific dish or cuisine! 🍽️`;
    }

    const restaurantSet = new Set(
      matches.map((i) => i.restaurant?.name).filter(Boolean),
    );

    const lines = matches.map(
      (item) =>
        `• ${item.name} at ${item.restaurant?.name} — PKR ${Number(item.price).toLocaleString()}${item.description ? ` (${item.description})` : ''}`,
    );

    let header = `Here's what I found for "${message}":\n\n`;
    if (restaurantSet.size === 1 && restaurantSet.size > 0) {
      header = `Great choice! ${restaurantSet.values().next().value} has these options:\n\n`;
    }

    return `${header}${lines.join('\n')}\n\nBrowse the restaurant menu to order! 🍴`;
  }

  async getConversations(userId: string): Promise<ChatConversation[]> {
    return this.conversationRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getMessages(conversationId: string, userId: string): Promise<ChatMessageEntity[]> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, userId },
    });
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    return this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async createConversation(userId: string, title = 'New Chat'): Promise<ChatConversation> {
    const conversation = this.conversationRepo.create({
      userId,
      title,
    });
    return this.conversationRepo.save(conversation);
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, userId },
    });
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    await this.conversationRepo.remove(conversation);
  }

  async chatInConversation(
    conversationId: string,
    userId: string,
    message: string,
  ): Promise<string> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, userId },
    });
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Rename title if it's the default and this is the first message using LLM summarization
    if (conversation.title === 'New Chat') {
      const summarizedTitle = await this.generateConversationTitle(message);
      conversation.title = summarizedTitle || 'New Chat';
      await this.conversationRepo.save(conversation);
    }

    // Fetch message history log
    const pastMessages = await this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    // Save User message
    const userMsg = this.messageRepo.create({
      conversationId,
      role: 'user',
      content: message,
    });
    await this.messageRepo.save(userMsg);

    // Map history to standard chat payload
    const history = pastMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Invoke existing RAG pipeline
    const reply = await this.chat(message, history);

    // Save Assistant response
    const assistantMsg = this.messageRepo.create({
      conversationId,
      role: 'assistant',
      content: reply,
    });
    await this.messageRepo.save(assistantMsg);

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await this.conversationRepo.save(conversation);

    return reply;
  }

  private async generateConversationTitle(message: string): Promise<string> {
    if (!this.groq) {
      return message.trim().substring(0, 25) + (message.length > 25 ? '...' : '');
    }
    try {
      const completion = await this.groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a title generator. Summarize the user query into a clean, concise, 2-4 words title in English. Do NOT use quotes, punctuation, or helper text. Only return the title itself.',
          },
          { role: 'user', content: message },
        ],
        max_tokens: 15,
        temperature: 0.5,
      });
      const title = completion.choices[0]?.message?.content?.trim();
      return title ? title.replace(/["']/g, '') : 'New Chat';
    } catch {
      return message.trim().substring(0, 25) + (message.length > 25 ? '...' : '');
    }
  }
}
