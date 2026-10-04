import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RoutingStrategy } from '../../src/modules/inference/strategies/routing.strategy';

describe('RoutingStrategy', () => {
  it('should select default tier model for fast text requests', () => {
    const decision = RoutingStrategy.selectRoute('text', 'default');
    assert.strictEqual(decision.providerName, 'nvidia');
    assert.strictEqual(decision.targetModelId, 'meta/llama-3.2-11b-vision-instruct');
  });

  it('should select pro tier model for json / reasoning capability', () => {
    const decision = RoutingStrategy.selectRoute('json', 'pro');
    assert.strictEqual(decision.providerName, 'nvidia');
    assert.strictEqual(decision.targetModelId, 'meta/llama-3.2-90b-vision-instruct');
  });

  it('should select vision tier model for vision capability', () => {
    const decision = RoutingStrategy.selectRoute('vision', 'apex');
    assert.strictEqual(decision.providerName, 'nvidia');
    assert.strictEqual(decision.targetModelId, 'meta/llama-3.2-90b-vision-instruct');
  });

  it('should route image-generation to pollinations provider', () => {
    const decision = RoutingStrategy.selectRoute('image-generation');
    assert.strictEqual(decision.providerName, 'pollinations');
    assert.strictEqual(decision.targetModelId, 'pollinations-flux');
  });

  it('should detect image creation intents', () => {
    const prompt = RoutingStrategy.detectImageIntent('/imagine a futuristic city skyline');
    assert.strictEqual(prompt, 'a futuristic city skyline');
  });
});
