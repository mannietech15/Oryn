import { ModelRouter, defaultModelRouter } from './model-router';
import { FallbackStrategy } from './strategies/fallback.strategy';
import {
  GenerationRequest,
  GenerationResponse,
  StreamChunk,
  ModelTier,
  ImageGenerationRequest,
  ImageGenerationResponse,
} from './inference.types';
import { Logger } from '../../infrastructure/logging/logger';
import { ProviderError } from '../../shared/errors/app-error';

const logger = new Logger('InferenceService');

export class InferenceService {
  constructor(private router: ModelRouter = defaultModelRouter) {}

  async generateText(request: GenerationRequest): Promise<GenerationResponse> {
    let currentTier: ModelTier = request.model || 'default';
    let attempt = 0;

    while (true) {
      try {
        const { provider } = this.router.route('text', currentTier);
        return await provider.generate({ ...request, model: currentTier });
      } catch (err: unknown) {
        const fallback = FallbackStrategy.evaluate(err, currentTier, attempt);

        if (fallback.action === 'downgrade' && fallback.nextTier) {
          logger.info(`Applying tier fallback: ${currentTier} -> ${fallback.nextTier}`);
          currentTier = fallback.nextTier;
          continue;
        }

        if (fallback.action === 'retry' && fallback.delayMs) {
          attempt++;
          logger.info(`Waiting ${fallback.delayMs}ms before retry...`);
          await new Promise((r) => setTimeout(r, fallback.delayMs));
          continue;
        }

        throw err;
      }
    }
  }

  async generateJson<T = any>(request: GenerationRequest): Promise<T> {
    const response = await this.generateText({
      ...request,
      responseFormat: { type: 'json_object' },
    });

    const content = response.content?.trim();
    if (!content) {
      throw new ProviderError('Provider returned empty completion content.', 'inference');
    }

    try {
      return JSON.parse(content) as T;
    } catch {
      throw new ProviderError('Failed to parse model response as JSON.', 'inference');
    }
  }

  async *streamText(
    request: GenerationRequest,
    signal?: AbortSignal,
    onStatus?: (status: string) => void
  ): AsyncIterable<StreamChunk> {
    let currentTier: ModelTier = request.model || 'default';
    let attempt = 0;

    while (true) {
      if (signal?.aborted) return;

      try {
        const { provider } = this.router.route('streaming', currentTier);
        const stream = provider.stream({ ...request, model: currentTier }, signal);

        for await (const chunk of stream) {
          if (signal?.aborted) return;
          yield chunk;
        }
        return;
      } catch (err: unknown) {
        if (signal?.aborted) return;

        const fallback = FallbackStrategy.evaluate(err, currentTier, attempt);

        if (fallback.action === 'downgrade' && fallback.nextTier) {
          onStatus?.('Optimizing model route...');
          currentTier = fallback.nextTier;
          continue;
        }

        if (fallback.action === 'retry' && fallback.delayMs) {
          attempt++;
          onStatus?.('Thinking...');
          await new Promise((r) => setTimeout(r, fallback.delayMs));
          continue;
        }

        throw err;
      }
    }
  }

  generateImage(request: ImageGenerationRequest): ImageGenerationResponse {
    return this.router.getPollinationsProvider().generateImage(request);
  }
}

export const defaultInferenceService = new InferenceService();
