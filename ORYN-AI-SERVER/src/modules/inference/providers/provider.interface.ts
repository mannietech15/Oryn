import {
  GenerationRequest,
  GenerationResponse,
  StreamChunk,
  ModelCapability
} from '../inference.types';

export interface AIProvider {
  readonly name: string;
  supports(capability: ModelCapability): boolean;
  generate(request: GenerationRequest): Promise<GenerationResponse>;
  stream(request: GenerationRequest, signal?: AbortSignal): AsyncIterable<StreamChunk>;
}
