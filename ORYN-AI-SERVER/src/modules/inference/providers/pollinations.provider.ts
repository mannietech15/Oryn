import { AIProvider } from './provider.interface';
import {
  GenerationRequest,
  GenerationResponse,
  StreamChunk,
  ModelCapability,
  ImageGenerationRequest,
  ImageGenerationResponse,
} from '../inference.types';
import { AI_CONFIG } from '../../../config/ai.config';
import { Logger } from '../../../infrastructure/logging/logger';

const logger = new Logger('PollinationsProvider');

export class PollinationsProvider implements AIProvider {
  public readonly name = 'pollinations';

  supports(capability: ModelCapability): boolean {
    return capability === 'image-generation';
  }

  async generate(_request: GenerationRequest): Promise<GenerationResponse> {
    throw new Error('PollinationsProvider only supports image generation');
  }

  async *stream(_request: GenerationRequest): AsyncIterable<StreamChunk> {
    throw new Error('PollinationsProvider does not support text streaming');
  }

  generateImage(request: ImageGenerationRequest): ImageGenerationResponse {
    const prompt = request.prompt.trim();
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1_000_000);
    const dimension = request.width || AI_CONFIG.imageGeneration.defaultDimension;
    const imageUrl = `${AI_CONFIG.imageGeneration.baseUrl}/${encodedPrompt}?width=${dimension}&height=${dimension}&nologo=true&seed=${seed}`;
    const filename = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50) + '.jpg';

    logger.info('Generated Pollinations image URL', { promptSnippet: prompt.slice(0, 30) });

    const htmlMarkup = `Generating your vision for **"${prompt}"**...\n\n<style>
      @keyframes shimmerGen {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
      }
    </style>
    <div style="margin-top: 16px; position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--card-border); box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 400px; aspect-ratio: 1/1; background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 75%); background-size: 200% 100%; animation: shimmerGen 2s infinite linear;">
      <button onclick="const a=document.createElement('a'); a.href='/api/download?url='+encodeURIComponent('${imageUrl}')+'&filename=${filename}'; a.click();" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; font-family: var(--font-sans); font-size: 11px; font-weight: 500; padding: 6px 12px; border-radius: 6px; transition: opacity 0.2s, background 0.2s; z-index: 10; opacity: 0;" onmouseover="this.style.background='rgba(0,0,0,0.8)'" onmouseout="this.style.background='rgba(0,0,0,0.6)'">Download</button>
      <img onload="this.style.opacity=1; this.previousElementSibling.style.opacity=1;" src="${imageUrl}" alt="${prompt}" style="width: 100%; height: 100%; display: block; object-fit: cover; opacity: 0; transition: opacity 0.8s ease;" />
    </div>`.replace(/\n/g, ' ');

    return {
      imageUrl,
      prompt,
      filename,
      htmlMarkup,
    };
  }
}
