import type { PropertyOption, PropertySchema, PropertyValidation } from './types';

export const textProp = (
  key: string,
  label: string,
  defaultValue: string = '',
  options?: Partial<PropertySchema<string>>,
): PropertySchema<string> => ({
  key,
  label,
  type: 'text',
  category: 'props',
  defaultValue,
  ...options,
});

export const textareaProp = (
  key: string,
  label: string,
  defaultValue: string = '',
  options?: Partial<PropertySchema<string>>,
): PropertySchema<string> => ({
  key,
  label,
  type: 'textarea',
  category: 'props',
  defaultValue,
  ...options,
});

export const numberProp = (
  key: string,
  label: string,
  defaultValue: number = 0,
  validation?: PropertyValidation | undefined,
  options?: Partial<PropertySchema<number>>,
): PropertySchema<number> => ({
  key,
  label,
  type: 'number',
  category: 'props',
  defaultValue,
  validation,
  ...options,
});

export const booleanProp = (
  key: string,
  label: string,
  defaultValue: boolean = false,
  options?: Partial<PropertySchema<boolean>>,
): PropertySchema<boolean> => ({
  key,
  label,
  type: 'boolean',
  category: 'props',
  defaultValue,
  ...options,
});

export const selectProp = <T extends string | number | boolean = string>(
  key: string,
  label: string,
  optionsList: PropertyOption[],
  defaultValue: T,
  options?: Partial<PropertySchema<T>>,
): PropertySchema<T> => ({
  key,
  label,
  type: 'select',
  category: 'props',
  options: optionsList,
  defaultValue,
  ...options,
});

export const colorProp = (
  key: string,
  label: string,
  defaultValue: string = '#000000',
  options?: Partial<PropertySchema<string>>,
): PropertySchema<string> => ({
  key,
  label,
  type: 'color',
  category: 'style',
  defaultValue,
  ...options,
});

export const imageProp = (
  key: string,
  label: string,
  defaultValue: string = '',
  options?: Partial<PropertySchema<string>>,
): PropertySchema<string> => ({
  key,
  label,
  type: 'image',
  category: 'props',
  defaultValue,
  ...options,
});

export const iconProp = (
  key: string,
  label: string,
  defaultValue: string = '',
  options?: Partial<PropertySchema<string>>,
): PropertySchema<string> => ({
  key,
  label,
  type: 'icon',
  category: 'props',
  defaultValue,
  ...options,
});

export const arrayProp = <T = unknown>(
  key: string,
  label: string,
  itemSchema: Record<string, PropertySchema>,
  defaultValue: T[] = [],
  options?: Partial<PropertySchema<T[]>>,
): PropertySchema<T[]> => ({
  key,
  label,
  type: 'array',
  category: 'props',
  itemSchema,
  defaultValue,
  ...options,
});

export const objectProp = <T = Record<string, unknown>>(
  key: string,
  label: string,
  itemSchema: Record<string, PropertySchema>,
  defaultValue?: T | undefined,
  options?: Partial<PropertySchema<T>>,
): PropertySchema<T> => ({
  key,
  label,
  type: 'object',
  category: 'props',
  itemSchema,
  defaultValue: defaultValue as T | undefined,
  ...options,
});
