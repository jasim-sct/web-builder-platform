import type { BaseSectionProps } from '../../types';

export type HeroVariant = 'split' | 'centered' | 'background';

export interface HeroProps {
  badge?: string;
  title: string;
  description: string;
  primaryButtonLabel: string;
  secondaryButtonLabel?: string;
  showSecondaryButton?: boolean;
  image?: string;
  imageAlt?: string;
  variant: HeroVariant;
}

export type HeroComponentProps = BaseSectionProps<HeroProps>;
