import type { ActionConfig, ResponsiveSectionStyle } from '../../types';
import type { HeroProps } from './types';

export const defaultHeroProps: HeroProps = {
  badge: '✨ Next Generation Platform',
  title: 'Build faster, scale smarter with our unified ecosystem',
  description:
    'Empower your engineering and design teams to build production-grade web applications in record time with reusable, high-performance sections.',
  primaryButtonLabel: 'Start Free Trial',
  secondaryButtonLabel: 'Book a Demo',
  showSecondaryButton: true,
  image:
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  imageAlt: 'Platform dashboard overview',
  variant: 'split',
};

export const defaultHeroStyle: ResponsiveSectionStyle = {
  desktop: {
    backgroundColor: '#ffffff',
    paddingTop: '96px',
    paddingBottom: '96px',
    paddingLeft: '24px',
    paddingRight: '24px',
    contentWidth: 'contained',
    alignment: 'left',
    headingColor: '#0f172a',
    bodyColor: '#475569',
  },
};

export const defaultHeroActions: Record<string, ActionConfig> = {
  primaryButtonAction: {
    type: 'navigate',
    url: '#get-started',
  },
  secondaryButtonAction: {
    type: 'navigate',
    url: '#demo',
  },
};
