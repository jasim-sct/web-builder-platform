import type { ActionConfig } from '../../types';
import type { HeaderProps } from './types';

export const defaultHeaderProps: HeaderProps = {
  logoText: 'Acme Corp',
  logoImage: '',
  links: [
    { id: '1', label: 'Features', href: '#features', target: '_self' },
    { id: '2', label: 'Pricing', href: '#pricing', target: '_self' },
    { id: '3', label: 'Testimonials', href: '#testimonials', target: '_self' },
    { id: '4', label: 'FAQ', href: '#faq', target: '_self' },
  ],
  ctaLabel: 'Get Started',
  showCta: true,
  sticky: true,
};

export const defaultHeaderActions: Record<string, ActionConfig> = {
  ctaAction: {
    type: 'navigate',
    url: '#get-started',
  },
};
