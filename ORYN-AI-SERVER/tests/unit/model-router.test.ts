import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ModelRouter } from '../../src/modules/inference/model-router';
import { AIProvider } from '../../src/modules/inference/providers/provider.interface';

class MockAIProvider implements AIProvider {
  constructor(public readonly name: string) {}

  async chat() {
    return { content: 'Mock response', model: 'mock-model' };
  }

  async *streamChat() {
    yield 'Mock chunk';
  }

  async isHealthy() {
    return true;
  }
}

describe('ModelRouter', () => {
  it('should register and retrieve providers by name', () => {
    const router = new ModelRouter(new MockAIProvider('nvidia') as any, new MockAIProvider('pollinations') as any);
    const mockCustom = new MockAIProvider('custom-llm');
    router.registerProvider(mockCustom);

    const retrieved = router.getProvider('custom-llm');
    assert.strictEqual(retrieved.name, 'custom-llm');
  });

  it('should throw ProviderError when provider is not registered', () => {
    const router = new ModelRouter(new MockAIProvider('nvidia') as any, new MockAIProvider('pollinations') as any);
    assert.throws(
      () => router.getProvider('non-existent-provider'),
      (err: any) => err.name === 'ProviderError' && err.message.includes('not registered')
    );
  });

  it('should route request to corresponding provider based on decision', () => {
    const router = new ModelRouter(new MockAIProvider('nvidia') as any, new MockAIProvider('pollinations') as any);
    const { provider, decision } = router.route('fast');
    assert.strictEqual(provider.name, 'nvidia');
    assert.strictEqual(decision.providerName, 'nvidia');
  });
});
