import { openai } from '../config/nvidia';
import { ENV } from '../config/env';

export class AnalysisService {
  static async analyzeFile(file: Express.Multer.File, prompt?: string, model?: string, language?: string) {
    const userPrompt = prompt || `Analyze this file and provide a concise business summary with key insights and action items. Respond in ${language || 'English'}.`;
    const isImage = file.mimetype.startsWith('image/');
    const activeModel = (isImage || model === 'pro') ? ENV.PRO_MODEL : ENV.DEFAULT_MODEL;

    let contentPayload: any;
    if (isImage) {
      const base64Image = file.buffer.toString('base64');
      contentPayload = [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: `data:${file.mimetype};base64,${base64Image}` } }
      ];
    } else {
      const fileContent = file.buffer.toString('utf-8');
      contentPayload = `${userPrompt}\n\nFile: ${file.originalname}\nContent:\n${fileContent.slice(0, 8000)}`;
    }

    const response = await openai.chat.completions.create({
      model: activeModel,
      messages: [{ role: 'user', content: contentPayload }],
      max_tokens: 1024,
    });

    const text = response.choices[0]?.message?.content || 'No analysis generated.';
    return { analysis: text, filename: file.originalname };
  }
}
