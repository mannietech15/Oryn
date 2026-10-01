import { Schema } from '../../shared/utils/validator';
import { EmailRequestDto } from './email.types';

export const emailRequestSchema = Schema.object<EmailRequestDto>({
  to: Schema.stringOrArray() as any,
  subject: Schema.string({ optional: true, max: 200 }) as any,
  body: Schema.string({ optional: true, max: 10000 }) as any,
  message: Schema.string({ optional: true, max: 10000 }) as any,
  content: Schema.string({ optional: true, max: 10000 }) as any,
});
