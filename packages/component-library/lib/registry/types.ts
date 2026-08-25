import type React from 'react';
import type { SectionSchema } from '../schema/types';
import type {
  ActionConfig,
  BaseSectionProps,
  PartialSectionInstance,
  SectionCategory,
  SectionInstance,
} from '../types';

export interface SectionMetadata {
  id: string;
  name: string;
  displayName: string;
  category: SectionCategory;
  description: string;
  version: string;
  preview?: string | undefined;
  tags: string[];
}

export interface SectionRegistryItem<P = Record<string, unknown>> extends SectionMetadata {
  componentId: string;
  component: React.ComponentType<BaseSectionProps<P>>;
  schema: SectionSchema;
  defaultProps: P;

  defaultActions: Record<string, ActionConfig>;
  generator: (overrides?: PartialSectionInstance<P>) => SectionInstance<P>;
}

export interface RenderSectionOptions {
  onAction?: ((actionName: string, actionConfig: ActionConfig) => void) | undefined;
  className?: string | undefined;
  isEditor?: boolean | undefined;
}
