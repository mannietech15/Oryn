import { InferenceMessage } from '../../inference/inference.types';

export class TextExtractor {
  static extract(file: Express.Multer.File, prompt: string, maxChars = 8000): InferenceMessage {
    const rawContent = file.buffer.toString('utf-8');
    const truncated = rawContent.slice(0, maxChars);
    const content = `${prompt}\n\nFile: ${file.originalname}\nContent:\n${truncated}`;

    return {
      role: 'user',
      content,
    };
  }
}
