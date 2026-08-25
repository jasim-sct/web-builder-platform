/**
 * Section Library Core Types
 * Defines the contracts for Section Instances, Responsive Styles, Actions, and Categories.
 */

export type SectionCategory =
  'Navigation' | 'Hero' | 'Content' | 'Media' | 'Business' | 'Conversion' | 'Utility';

export type ActionType =
  | 'navigate'
  | 'externalUrl'
  | 'openPopup'
  | 'closePopup'
  | 'scrollToSection'
  | 'submitApi'
  | 'formAction'
  | 'custom';

export interface ActionConfig {
  type: ActionType;
  target?: string | undefined;
  url?: string | undefined;
  popupId?: string | undefined;
  sectionId?: string | undefined;
  payload?: Record<string, unknown> | undefined;
  openInNewTab?: boolean | undefined;
}

export interface SectionStyle {
  // Layout
  alignment?: ('left' | 'center' | 'right') | undefined;
  direction?: ('row' | 'column' | 'row-reverse' | 'column-reverse') | undefined;
  gap?: (string | number) | undefined;
  contentWidth?: ('contained' | 'narrow' | 'wide' | 'full') | undefined;

  // Size
  minHeight?: (string | number) | undefined;
  maxHeight?: (string | number) | undefined;
  width?: (string | number) | undefined;
  maxWidth?: (string | number) | undefined;

  // Spacing
  paddingTop?: (string | number) | undefined;
  paddingBottom?: (string | number) | undefined;
  paddingLeft?: (string | number) | undefined;
  paddingRight?: (string | number) | undefined;
  marginTop?: (string | number) | undefined;
  marginBottom?: (string | number) | undefined;

  // Typography
  fontFamily?: string | undefined;
  headingColor?: string | undefined;
  bodyColor?: string | undefined;
  accentColor?: string | undefined;
  textAlign?: ('left' | 'center' | 'right') | undefined;
  fontSize?: (string | number) | undefined;
  fontWeight?: (string | number) | undefined;
  lineHeight?: (string | number) | undefined;

  // Background
  backgroundColor?: string | undefined;
  backgroundImage?: string | undefined;
  backgroundPosition?: string | undefined;
  backgroundSize?: ('cover' | 'contain' | 'auto') | undefined;
  backgroundRepeat?: ('no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y') | undefined;
  backgroundOverlay?: string | undefined;

  // Border
  borderWidth?: (string | number) | undefined;
  borderStyle?: ('none' | 'solid' | 'dashed' | 'dotted') | undefined;
  borderColor?: string | undefined;
  borderRadius?: (string | number) | undefined;

  // Effects
  boxShadow?: ('none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string) | undefined;
  opacity?: number | undefined;
}

export interface ResponsiveSectionStyle {
  desktop?: SectionStyle | undefined;
  tablet?: SectionStyle | undefined;
  mobile?: SectionStyle | undefined;
}

export interface SectionInstance<P = Record<string, unknown>> {
  id: string;
  componentId: string;
  props: P;
  style?: ResponsiveSectionStyle | undefined;
  actions?: Record<string, ActionConfig> | undefined;
}

export type PartialSectionInstance<P = Record<string, unknown>> = Partial<
  Omit<SectionInstance<P>, 'props'>
> & {
  props?: Partial<P> | undefined;
};

export interface BaseSectionProps<P = Record<string, unknown>> {
  id?: string | undefined;
  props?: Partial<P> | undefined;
  style?: ResponsiveSectionStyle | undefined;
  actions?: Record<string, ActionConfig> | undefined;
  className?: string | undefined;
  onAction?: ((actionName: string, actionConfig: ActionConfig) => void) | undefined;
  isEditor?: boolean | undefined;
}
