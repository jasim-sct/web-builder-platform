import type { ActionConfig, ResponsiveSectionStyle } from '../../types';
import type { FAQProps } from './types';

export const defaultFAQProps: FAQProps = {
  badge: 'Common Questions',
  title: 'Frequently Asked Questions',
  description:
    'Find clear answers to common questions about our platform, security, pricing, and integration capabilities.',
  showCategoryFilter: true,
  items: [
    {
      id: '1',
      question: 'How quickly can we deploy our website with this library?',
      answer:
        'With our pre-built section library and component schemas, teams typically design and launch production-ready landing pages and web apps in under an hour without writing custom CSS.',
      category: 'General',
    },
    {
      id: '2',
      question: 'Is the component code fully accessible and SEO-friendly?',
      answer:
        'Yes! Every section is constructed with semantic HTML5 elements, correct ARIA roles and labels, keyboard navigation support, and optimized image alt handling.',
      category: 'Technical',
    },
    {
      id: '3',
      question: 'Can we customize the branding, fonts, and color palettes?',
      answer:
        'Absolutely. The section style model supports comprehensive design token overrides including primary, heading, and body colors, font families, container widths, borders, and shadows.',
      category: 'Customization',
    },
    {
      id: '4',
      question: 'How does the Section Schema integrate with the Web Editor?',
      answer:
        'Each section exports a strongly typed schema declaring its Props, Styles, and Actions. The Web Editor inspects this contract to automatically generate controls without duplicate code.',
      category: 'Technical',
    },
    {
      id: '5',
      question: 'What kind of support is included with the Enterprise plan?',
      answer:
        'Enterprise plans include dedicated technical account management, 99.99% uptime SLAs, custom engineering onboarding, and 24/7 priority support.',
      category: 'Pricing',
    },
  ],
};

export const defaultFAQStyle: ResponsiveSectionStyle = {
  desktop: {
    backgroundColor: '#ffffff',
    paddingTop: '88px',
    paddingBottom: '88px',
    paddingLeft: '24px',
    paddingRight: '24px',
    contentWidth: 'narrow',
    textAlign: 'center',
  },
};

export const defaultFAQActions: Record<string, ActionConfig> = {
  faqToggleAction: {
    type: 'custom',
  },
};
