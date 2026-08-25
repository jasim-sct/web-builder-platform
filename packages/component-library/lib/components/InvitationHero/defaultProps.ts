
import type { ActionConfig } from '../../types';
import type { InvitationHeroProps } from './types';
export const defaultInvitationHeroProps: InvitationHeroProps = {
  layout: 'split',
  title: 'Alex & Sam',
  subtitle: 'Are Getting Married',
  date: 'Saturday, October 14, 2028',
  location: 'The Botanical Gardens, New York',
  image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
  primaryButtonLabel: 'RSVP Now',
};
export const defaultInvitationHeroActions: Record<string, ActionConfig> = {
  primaryAction: { type: 'scrollToSection', target: 'rsvp' }
};
