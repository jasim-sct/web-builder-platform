import type { ActionConfig, ResponsiveSectionStyle } from '../../types';
import type { CarouselProps } from './types';

export const defaultCarouselProps: CarouselProps = {
  badge: 'Product Showcase',
  title: 'Experience unmatched digital craftsmanship',
  description:
    'Browse through our interactive highlights and explore the core innovations powering our platform.',
  autoplay: true,
  interval: 5000,
  items: [
    {
      id: '1',
      title: 'Modern Cloud Infrastructure',
      subtitle: 'Instant provisioning with global edge delivery',
      image:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Cloud servers and networking',
      ctaText: 'Explore Cloud',
      ctaUrl: '#cloud',
    },
    {
      id: '2',
      title: 'Collaborative Real-Time Workspace',
      subtitle: 'Build and deploy alongside your distributed team',
      image:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Team collaborating on design',
      ctaText: 'Explore Teams',
      ctaUrl: '#teams',
    },
    {
      id: '3',
      title: 'Actionable Intelligence & Metrics',
      subtitle: 'Gain deep visibility into every user interaction',
      image:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Analytics dashboard view',
      ctaText: 'Explore Analytics',
      ctaUrl: '#analytics',
    },
  ],
};

export const defaultCarouselStyle: ResponsiveSectionStyle = {
  desktop: {
    backgroundColor: '#ffffff',
    paddingTop: '80px',
    paddingBottom: '80px',
    paddingLeft: '24px',
    paddingRight: '24px',
    contentWidth: 'contained',
    textAlign: 'center',
  },
};

export const defaultCarouselActions: Record<string, ActionConfig> = {
  slideChangeAction: {
    type: 'custom',
  },
  slideCtaAction: {
    type: 'navigate',
  },
};
