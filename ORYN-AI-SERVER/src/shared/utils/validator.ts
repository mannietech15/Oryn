import { ValidationError } from '../errors/app-error';

export type ValidatorRule<T> = (val: unknown, fieldName: string) => T;

export const Schema = {
  string(options?: { min?: number; max?: number; pattern?: RegExp; optional?: boolean }): ValidatorRule<string | undefined> {
    return (val: unknown, fieldName: string) => {
      if (val === undefined || val === null || val === '') {
        if (options?.optional) return undefined;
        throw new ValidationError(`Field '${fieldName}' is required and must be a string.`);
      }
      if (typeof val !== 'string') {
        throw new ValidationError(`Field '${fieldName}' must be a string.`);
      }
      const trimmed = val.trim();
      if (options?.min !== undefined && trimmed.length < options.min) {
        throw new ValidationError(`Field '${fieldName}' must be at least ${options.min} characters.`);
      }
      if (options?.max !== undefined && trimmed.length > options.max) {
        throw new ValidationError(`Field '${fieldName}' must be no more than ${options.max} characters.`);
      }
      if (options?.pattern && !options.pattern.test(trimmed)) {
        throw new ValidationError(`Field '${fieldName}' has an invalid format.`);
      }
      return trimmed;
    };
  },

  number(options?: { min?: number; max?: number; optional?: boolean }): ValidatorRule<number | undefined> {
    return (val: unknown, fieldName: string) => {
      if (val === undefined || val === null || val === '') {
        if (options?.optional) return undefined;
        throw new ValidationError(`Field '${fieldName}' is required and must be a number.`);
      }
      const num = typeof val === 'number' ? val : Number(val);
      if (Number.isNaN(num)) {
        throw new ValidationError(`Field '${fieldName}' must be a valid number.`);
      }
      if (options?.min !== undefined && num < options.min) {
        throw new ValidationError(`Field '${fieldName}' must be >= ${options.min}.`);
      }
      if (options?.max !== undefined && num > options.max) {
        throw new ValidationError(`Field '${fieldName}' must be <= ${options.max}.`);
      }
      return num;
    };
  },

  boolean(options?: { optional?: boolean }): ValidatorRule<boolean | undefined> {
    return (val: unknown, fieldName: string) => {
      if (val === undefined || val === null) {
        if (options?.optional) return undefined;
        throw new ValidationError(`Field '${fieldName}' is required and must be a boolean.`);
      }
      if (typeof val === 'boolean') return val;
      if (val === 'true' || val === '1') return true;
      if (val === 'false' || val === '0') return false;
      throw new ValidationError(`Field '${fieldName}' must be a boolean.`);
    };
  },

  array<T>(itemValidator: ValidatorRule<T>, options?: { min?: number; max?: number; optional?: boolean }): ValidatorRule<T[] | undefined> {
    return (val: unknown, fieldName: string) => {
      if (val === undefined || val === null) {
        if (options?.optional) return undefined;
        throw new ValidationError(`Field '${fieldName}' is required and must be an array.`);
      }
      if (!Array.isArray(val)) {
        throw new ValidationError(`Field '${fieldName}' must be an array.`);
      }
      if (options?.min !== undefined && val.length < options.min) {
        throw new ValidationError(`Field '${fieldName}' must contain at least ${options.min} items.`);
      }
      if (options?.max !== undefined && val.length > options.max) {
        throw new ValidationError(`Field '${fieldName}' cannot contain more than ${options.max} items.`);
      }
      return val.map((item, idx) => itemValidator(item, `${fieldName}[${idx}]`));
    };
  },

  object<T extends Record<string, any>>(shape: { [K in keyof T]: ValidatorRule<T[K]> }): ValidatorRule<T> {
    return (val: unknown, fieldName: string) => {
      if (typeof val !== 'object' || val === null || Array.isArray(val)) {
        throw new ValidationError(`Field '${fieldName}' must be an object.`);
      }
      const result = {} as T;
      const record = val as Record<string, unknown>;
      for (const [key, rule] of Object.entries(shape)) {
        result[key as keyof T] = (rule as ValidatorRule<any>)(record[key], key);
      }
      return result;
    };
  },

  stringOrArray(options?: { optional?: boolean }): ValidatorRule<string[] | undefined> {
    return (val: unknown, fieldName: string) => {
      if (val === undefined || val === null || val === '') {
        if (options?.optional) return undefined;
        throw new ValidationError(`Field '${fieldName}' is required.`);
      }
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) throw new ValidationError(`Field '${fieldName}' cannot be empty.`);
        return [trimmed];
      }
      if (Array.isArray(val)) {
        if (val.length === 0) throw new ValidationError(`Field '${fieldName}' array cannot be empty.`);
        return val.map((item, idx) => {
          if (typeof item !== 'string' || !item.trim()) {
            throw new ValidationError(`Field '${fieldName}[${idx}]' must be a non-empty string.`);
          }
          return item.trim();
        });
      }
      throw new ValidationError(`Field '${fieldName}' must be a string or array of strings.`);
    };
  }
};
