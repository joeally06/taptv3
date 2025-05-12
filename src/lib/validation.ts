import { ValidationError } from './errors/AppError.js';

export type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

export const validate = <T>(value: T, rules: ValidationRule<T>[]): void => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      throw new ValidationError(rule.message);
    }
  }
};

export const rules = {
  required: (fieldName: string): ValidationRule<any> => ({
    validate: (value: any) => value !== undefined && value !== null && value !== '',
    message: `${fieldName} is required`
  }),

  email: (): ValidationRule<string> => ({
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Invalid email format'
  }),

  phone: (): ValidationRule<string> => ({
    validate: (value: string) => /^\+?[\d\s-]{10,}$/.test(value),
    message: 'Invalid phone number format'
  }),

  minLength: (fieldName: string, min: number): ValidationRule<string> => ({
    validate: (value: string) => value.length >= min,
    message: `${fieldName} must be at least ${min} characters long`
  }),

  maxLength: (fieldName: string, max: number): ValidationRule<string> => ({
    validate: (value: string) => value.length <= max,
    message: `${fieldName} must not exceed ${max} characters`
  }),

  future: (fieldName: string): ValidationRule<Date> => ({
    validate: (value: Date) => new Date(value) > new Date(),
    message: `${fieldName} must be in the future`
  }),

  numeric: (fieldName: string): ValidationRule<any> => ({
    validate: (value: any) => !isNaN(value) && typeof value === 'number',
    message: `${fieldName} must be a number`
  }),

  min: (fieldName: string, min: number): ValidationRule<number> => ({
    validate: (value: number) => value >= min,
    message: `${fieldName} must be at least ${min}`
  }),

  max: (fieldName: string, min: number): ValidationRule<number> => ({
    validate: (value: number) => value <= min,
    message: `${fieldName} must not exceed ${min}`
  })
};