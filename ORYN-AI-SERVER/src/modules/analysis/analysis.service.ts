import { AnalysisResponseDto } from './analysis.types';
import { ImageExtractor } from './extractors/image.extractor';
import { TextExtractor } from './extractors/text.extractor';
import { InferenceService, defaultInferenceService } from '../inference/inference.service';
import { InferenceMessage } from '../inference/inference.types';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('AnalysisService');

export class AnalysisService {
  constructor(private inference: InferenceService = defaultInferenceService) {}

  async analyzeFile(
    file: Express.Multer.File,
    prompt?: string,
    model?: string,
    language?: string
  ): Promise<AnalysisResponseDto> {
    const userPrompt =
      prompt ||
      `Analyze this file and provide a concise business summary with key insights and action items. Respond in ${
        language || 'English'
      }.`;

    const isImage = ImageExtractor.isImage(file.mimetype);
    const activeTier = isImage || model === 'pro' ? 'pro' : 'default';

    let message: InferenceMessage;
    if (isImage) {
      message = ImageExtractor.extract(file, userPrompt);
    } else {
      message = TextExtractor.extract(file, userPrompt);
    }

    logger.info('Analyzing file', {
      filename: file.originalname,
      isImage,
      mimetype: file.mimetype,
      tier: activeTier,
    });

    const response = await this.inference.generateText({
      model: activeTier,
      messages: [message],
      maxTokens: 1024,
    });

    const analysis = response.content || 'No analysis generated.';
    return {
      analysis,
      filename: file.originalname,
    };
  }
}

export const defaultAnalysisService = new AnalysisService();
