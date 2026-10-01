import { InferenceMessage } from '../../inference/inference.types';

export class ImageExtractor {
  static isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  static extract(file: Express.Multer.File, prompt: string): InferenceMessage {
    const base64Image = file.buffer.toString('base64');
    return {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: `data:${file.mimetype};base64,${base64Image}`,
          },
        },
      ],
    };
  }
}
