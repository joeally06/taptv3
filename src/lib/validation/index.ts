import { ValidationError } from '../errors/AppError.js';
import { rules } from './rules.js';

type ValidationRule = {
  validate: (value: any) => boolean;
  message: string;
};

export function validate(value: any, validations: ValidationRule[]) {
  for (const validation of validations) {
    if (!validation.validate(value)) {
      throw new ValidationError(validation.message);
    }
  }
}

export { rules };