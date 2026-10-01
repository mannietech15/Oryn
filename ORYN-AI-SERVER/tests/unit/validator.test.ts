import { describe, it } from 'node:test';
import assert from 'node:assert';
import { chatRequestSchema } from '../../src/modules/chat/chat.schemas';
import { ValidationError } from '../../src/shared/errors/app-error';

describe('Validator Utility & Schemas', () => {
  it('should validate valid chat requests without errors', () => {
    const validData = {
      messages: [{ role: 'user', content: 'Hello ORYN' }],
      model: 'fast',
    };
    const validated = chatRequestSchema(validData, 'body');
    assert.strictEqual(validated.messages.length, 1);
    assert.strictEqual(validated.messages[0].content, 'Hello ORYN');
    assert.strictEqual(validated.model, 'fast');
  });

  it('should throw ValidationError when messages array is empty', () => {
    const invalidData = {
      messages: [],
    };
    assert.throws(
      () => chatRequestSchema(invalidData, 'body'),
      (err: any) => err instanceof ValidationError && err.message.includes('at least 1 items')
    );
  });

  it('should throw ValidationError when messages field is not an array', () => {
    const invalidData = {
      messages: 'invalid string',
    };
    assert.throws(
      () => chatRequestSchema(invalidData, 'body'),
      (err: any) => err instanceof ValidationError && err.message.includes('must be an array')
    );
  });

  it('should throw ValidationError when body is not an object', () => {
    assert.throws(
      () => chatRequestSchema('not an object', 'body'),
      (err: any) => err instanceof ValidationError && err.message.includes('must be an object')
    );
  });
});
