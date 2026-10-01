import { Schema } from '../../shared/utils/validator';
import { ChatRequestDto, ChatMessage } from './chat.types';

const chatMessageSchema = Schema.object<ChatMessage>({
  role: (val: unknown) => {
    if (val !== 'user' && val !== 'assistant' && val !== 'system') {
      return 'user';
    }
    return val;
  },
  content: Schema.string({ min: 1 }) as any,
});

export const chatRequestSchema = Schema.object<ChatRequestDto>({
  messages: Schema.array(chatMessageSchema, { min: 1 }) as any,
  webSearch: Schema.boolean({ optional: true }) as any,
  taskExtract: Schema.boolean({ optional: true }) as any,
  model: Schema.string({ optional: true }) as any,
  language: Schema.string({ optional: true }) as any,
});
