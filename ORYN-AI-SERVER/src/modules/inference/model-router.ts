import { AIProvider } from './providers/provider.interface';
import { NvidiaProvider } from './providers/nvidia.provider';
import { PollinationsProvider } from './providers/pollinations.provider';
import { RoutingStrategy, RouteDecision } from './strategies/routing.strategy';
import { ModelCapability, ModelTier } from './inference.types';
import { ENV } from '../../config/env';
import { ProviderError } from '../../shared/errors/app-error';
import { ErrorCode } from '../../shared/errors/error-codes';

export class ModelRouter {
  private providers: Map<string, AIProvider> = new Map();
  private pollinations: PollinationsProvider;

  constructor(
    customNvidia?: NvidiaProvider,
    customPollinations?: PollinationsProvider
  ) {
    const nvidia = customNvidia || new NvidiaProvider(
      ENV.NVIDIA_API_KEY,
      ENV.NVIDIA_LOGIC_API_KEY,
      ENV.NVIDIA_APEX_API_KEY
    );
    this.pollinations = customPollinations || new PollinationsProvider();

    this.registerProvider(nvidia);
    this.registerProvider(this.pollinations);
  }

  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new ProviderError(`Provider '${name}' is not registered.`, name, ErrorCode.PROVIDER_UNAVAILABLE);
    }
    return provider;
  }

  getPollinationsProvider(): PollinationsProvider {
    return this.pollinations;
  }

  route(capability: ModelCapability, requestedTier?: ModelTier): { provider: AIProvider; decision: RouteDecision } {
    const decision = RoutingStrategy.selectRoute(capability, requestedTier);
    const provider = this.getProvider(decision.providerName);
    return { provider, decision };
  }
}

export const defaultModelRouter = new ModelRouter();
