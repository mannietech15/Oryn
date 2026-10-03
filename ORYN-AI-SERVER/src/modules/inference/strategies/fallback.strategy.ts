import { ModelTier } from '../inference.types';
import { AI_CONFIG } from '../../../config/ai.config';
import { ProviderError } from '../../../shared/errors/app-error';
import { ErrorCode } from '../../../shared/errors/error-codes';
import { Logger } from '../../../infrastructure/logging/logger';

const logger = new Logger('FallbackStrategy');

export interface FallbackAction {
  action: 'retry' | 'downgrade' | 'fail';
  nextTier?: ModelTier;
  delayMs?: number;
  reason: string;
}

export class FallbackStrategy {
  static evaluate(
    error: unknown,
    currentTier: ModelTier,
    attempt: number
  ): FallbackAction {
    const isProviderError = error instanceof ProviderError;
    const errorCode = isProviderError ? error.code : ErrorCode.PROVIDER_ERROR;
    const isRateLimit = errorCode === ErrorCode.PROVIDER_RATE_LIMITED;
    const isUnavailable = errorCode === ErrorCode.PROVIDER_UNAVAILABLE;
    const isRetryable = isProviderError ? error.retryable : false;

    const maxRetries = AI_CONFIG.nvidia.maxRetries;
    const delays = AI_CONFIG.nvidia.retryDelaysMs;

    // Check if default tier cluster node is unavailable/OOM; failover to pro tier cluster
    if ((isUnavailable || isRetryable) && currentTier === 'default' && attempt === 0) {
      logger.warn(`Default tier cluster node unavailable. Failing over to pro tier.`, {
        error: isProviderError ? error.message : String(error),
      });
      return {
        action: 'downgrade',
        nextTier: 'pro',
        reason: 'Default tier node unavailable; routing to pro tier cluster.',
      };
    }

    // Check if we can downgrade from pro/apex/logic to default
    if ((isUnavailable || isRateLimit) && currentTier !== 'default') {
      logger.warn(`Model tier ${currentTier} failed. Downgrading to default tier.`, {
        error: isProviderError ? error.message : String(error),
      });
      return {
        action: 'downgrade',
        nextTier: 'default',
        reason: `Model tier ${currentTier} unavailable. Downgraded to default tier.`,
      };
    }

    // Check if we should back off and retry
    if ((isRateLimit || isUnavailable || isRetryable) && attempt < maxRetries) {
      const delayMs = delays[attempt] || 2000;
      logger.warn(`Transient upstream error detected on attempt ${attempt + 1}. Retrying in ${delayMs}ms.`);
      return {
        action: 'retry',
        delayMs,
        reason: 'Transient upstream error encountered, backing off before retry.',
      };
    }

    return {
      action: 'fail',
      reason: isProviderError ? error.message : 'Exhausted retry limits or encountered non-retryable error.',
    };
  }
}
