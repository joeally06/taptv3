export const rules = {
  required: (fieldName: string) => ({
    validate: (value: any) => value != null && value !== '',
    message: `${fieldName} is required`
  }),

  maxLength: (fieldName: string, max: number) => ({
    validate: (value: string) => !value || value.length <= max,
    message: `${fieldName} must be no longer than ${max} characters`
  }),

  numeric: (fieldName: string) => ({
    validate: (value: any) => !value || !isNaN(Number(value)),
    message: `${fieldName} must be a number`
  }),

  min: (fieldName: string, min: number) => ({
    validate: (value: number) => !value || value >= min,
    message: `${fieldName} must be at least ${min}`
  }),

  email: () => ({
    validate: (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Invalid email address'
  }),

  phone: () => ({
    validate: (value: string) => !value || /^\+?[\d\s-()]+$/.test(value),
    message: 'Invalid phone number'
  }),

  future: (fieldName: string) => ({
    validate: (value: string | Date) => {
      if (!value) return true;
      const date = new Date(value);
      return date > new Date();
    },
    message: `${fieldName} must be in the future`
  })
};