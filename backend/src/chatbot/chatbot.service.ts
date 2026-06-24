import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { MenusService } from '../menus/menus.service';
import { MenuItem } from '../restaurants/menu-item.entity';

const GROQ_MODEL = 'llama-3.1-8b-instant';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly groq: Groq | null;

  constructor(
    private readonly config: ConfigService,
    private readonly menusService: MenusService,
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
      this.groq = new Groq({ apiKey });
    }
  }

  async chat(message: string): Promise<string> {
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

    if (!this.groq) {
      return this.localFoodSearch(message, menuItems);
    }

    try {
      return await this.groqChat(message, menuItems);
    } catch (error) {
      this.logger.error('Groq API error, falling back to local search', error);
      return this.localFoodSearch(message, menuItems);
    }
  }

  private async groqChat(message: string, menuItems: MenuItem[]): Promise<string> {
    const menuContext = this.buildMenuContext(menuItems);

    const systemPrompt = `You are a food discovery assistant for a food ordering platform.
Your ONLY job is to help users find dishes and restaurants based on what they want to eat.
You must NEVER discuss orders, complaints, payments, or anything unrelated to food discovery.
If asked about non-food topics, politely redirect to food discovery.

Here is the current available menu data:
${menuContext}

Guidelines:
- Answer only food discovery questions (what to eat, where to find dishes, restaurant recommendations)
- Recommend specific restaurants and dishes based on the menu data above
- Be concise and helpful
- If a dish isn't available, say so and suggest alternatives
- Do not make up dishes or restaurants not in the data above`;

    const completion = await this.groq!.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
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

  private localFoodSearch(message: string, menuItems: MenuItem[]): string {
    const terms = message
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);

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
}
