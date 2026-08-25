import type { ActionType } from '../types';

export type PropertyType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'image'
  | 'icon'
  | 'link'
  | 'action'
  | 'spacing'
  | 'typography'
  | 'border'
  | 'shadow'
  | 'object'
  | 'array';

export interface PropertyOption {
  label: string;
  value: string | number | boolean;
}

export interface PropertyValidation {
  min?: number | undefined;
  max?: number | undefined;
  minLength?: number | undefined;
  maxLength?: number | undefined;
  pattern?: string | undefined;
  required?: boolean | undefined;
}

export interface PropertySchema<T = unknown> {
  key: string;
  label: string;
  type: PropertyType;
  category?: ('props' | 'style' | 'actions') | undefined;
  defaultValue?: T | undefined;
  required?: boolean | undefined;
  description?: string | undefined;
  placeholder?: string | undefined;
  options?: PropertyOption[] | undefined;
  validation?: PropertyValidation | undefined;
  responsive?: boolean | undefined;
  visibility?: ((props: Record<string, unknown>) => boolean) | undefined;
  itemSchema?: Record<string, PropertySchema> | undefined;
}

export interface ActionPropertySchema {
  key: string;
  label: string;
  description?: string | undefined;
  supportedActions: ActionType[];
  defaultAction?: ActionType | undefined;
}

export interface SectionSchema {
  props: Record<string, PropertySchema>;
  style: Record<string, PropertySchema>;
  actions: Record<string, ActionPropertySchema>;
}
