import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ChatConversation } from './chat-conversation.entity';

@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @ManyToOne(() => ChatConversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  conversation: ChatConversation;

  @Column({ type: 'varchar', length: 20 })
  role: 'user' | 'assistant';

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
