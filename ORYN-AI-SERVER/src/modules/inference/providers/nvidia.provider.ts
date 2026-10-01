import OpenAI from 'openai';
import { AIProvider } from './provider.interface';
import {
  GenerationRequest,
  GenerationResponse,
  StreamChunk,
  ModelCapability,
} from '../inference.types';
import { AI_CONFIG } from '../../../config/ai.config';
import { ProviderError } from '../../../shared/errors/app-error';
import { ErrorCode } from '../../../shared/errors/error-codes';
import { Logger } from '../../../infrastructure/logging/logger';

const logger = new Logger('NvidiaProvider');

export class NvidiaProvider implements AIProvider {
  public readonly name = 'nvidia';
  private clients: Map<string, OpenAI> = new Map();

  constructor(
    defaultKey: string,
    logicKey?: string,
    apexKey?: string
  ) {
    this.clients.set('default', new OpenAI({
      apiKey: defaultKey,
      baseURL: AI_CONFIG.nvidia.baseUrl,
      timeout: AI_CONFIG.nvidia.timeoutMs,
    }));

    if (logicKey && logicKey !== defaultKey) {
      this.clients.set('logic', new OpenAI({
        apiKey: logicKey,
        baseURL: AI_CONFIG.nvidia.baseUrl,
        timeout: AI_CONFIG.nvidia.timeoutMs,
      }));
    }

    if (apexKey && apexKey !== defaultKey) {
      this.clients.set('apex', new OpenAI({
        apiKey: apexKey,
        baseURL: AI_CONFIG.nvidia.baseUrl,
        timeout: AI_CONFIG.nvidia.timeoutMs,
      }));
    }
  }

  private getClient(tier?: string): OpenAI {
    if (tier && this.clients.has(tier)) {
      return this.clients.get(tier)!;
    }
    return this.clients.get('default')!;
  }

  supports(capability: ModelCapability): boolean {
    switch (capability) {
      case 'text':
      case 'vision':
      case 'json':
      case 'streaming':
        return true;
      case 'image-generation':
        return false;
      default:
        return false;
    }
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const client = this.getClient(request.model);
    const modelId = this.resolveModelId(request.model);

    try {
      logger.info('Dispatching generation request to NVIDIA', { model: modelId });
      const completion = await client.chat.completions.create({
        model: modelId,
        messages: request.messages as any,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        response_format: request.responseFormat as any,
      });

      const choice = completion.choices[0];
      return {
        content: choice?.message?.content || '',
        model: completion.model || modelId,
        provider: this.name,
        usage: {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
      };
    } catch (err: any) {
      throw this.normalizeError(err, modelId);
    }
  }

  async *stream(request: GenerationRequest, signal?: AbortSignal): AsyncIterable<StreamChunk> {
    const client = this.getClient(request.model);
    const modelId = this.resolveModelId(request.model);

    try {
      logger.info('Opening streaming connection to NVIDIA', { model: modelId });
      const stream = await client.chat.completions.create(
        {
          model: modelId,
          messages: request.messages as any,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          stream: true,
        },
        { signal }
      );

      for await (const chunk of stream) {
        if (signal?.aborted) {
          logger.info('Stream generation aborted via signal');
          break;
        }
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          yield { text: delta };
        }
      }
      yield { text: '', done: true };
    } catch (err: any) {
      if (signal?.aborted) {
        return;
      }
      throw this.normalizeError(err, modelId);
    }
  }

  public resolveModelId(tier?: string): string {
    if (tier === 'pro' || tier === 'apex') {
      return AI_CONFIG.models.pro.id;
    }
    return AI_CONFIG.models.default.id;
  }

  private normalizeError(err: any, modelId: string): ProviderError {
    const msg = err.message || 'Unknown provider error';
    const status = err.status || 500;
    const is429 = msg.includes('429') || status === 429 || msg.toLowerCase().includes('rate-limit') || msg.toLowerCase().includes('rate_limit');
    const is410 = msg.includes('410') || status === 410;
    const is404 = msg.includes('404') || status === 404;

    logger.error('NVIDIA API Error', { model: modelId, error: msg, status });

    if (is429) {
      return new ProviderError(
        'The AI model is temporarily rate-limited on the free tier. Please wait a moment and try again.',
        this.name,
        ErrorCode.PROVIDER_RATE_LIMITED,
        429,
        true
      );
    }
    if (is410 || is404) {
      return new ProviderError(
        'The requested model endpoint was updated or unavailable.',
        this.name,
        ErrorCode.PROVIDER_UNAVAILABLE,
        503,
        false
      );
    }
    return new ProviderError(msg, this.name, ErrorCode.PROVIDER_ERROR, status, false);
  }
}
