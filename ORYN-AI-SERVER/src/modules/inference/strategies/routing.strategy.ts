import { ModelCapability, ModelTier } from '../inference.types';
import { AI_CONFIG } from '../../../config/ai.config';

export interface RouteDecision {
  providerName: string;
  modelTier: ModelTier;
  targetModelId: string;
}

export class RoutingStrategy {
  static selectRoute(capability: ModelCapability, requestedTier?: ModelTier): RouteDecision {
    if (capability === 'image-generation') {
      return {
        providerName: 'pollinations',
        modelTier: 'image',
        targetModelId: 'pollinations-flux',
      };
    }

    const tier = requestedTier || 'default';
    let targetModelId = AI_CONFIG.models.default.id;

    if (tier === 'pro' || tier === 'apex') {
      targetModelId = AI_CONFIG.models.pro.id;
    }

    return {
      providerName: 'nvidia',
      modelTier: tier,
      targetModelId,
    };
  }

  static detectImageIntent(text: string): string | null {
    const trimmed = text.trim().toLowerCase();
    const match = trimmed.match(
      /^(?:\/imagine\s+|(?:please\s+)?(?:generate|create|make|draw)\s+(?:(?:an?\s+|the\s+)?(?:image|picture)s?(?:\s+of)?\s+))(.+)/
    );
    return match ? match[1].trim() : null;
  }
}
