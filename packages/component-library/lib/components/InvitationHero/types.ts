
import type { BaseSectionProps } from '../../types';
export interface InvitationHeroProps {
  layout?: 'split' | 'background';
  title?: string;
  subtitle?: string;
  date?: string;
  location?: string;
  image?: string;
  primaryButtonLabel?: string;
}
export interface InvitationHeroComponentProps extends BaseSectionProps<InvitationHeroProps> {}
