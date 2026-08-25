import type { ActionConfig, ResponsiveSectionStyle } from '../../types';
import type { FeaturesProps } from './types';

export const defaultFeaturesProps: FeaturesProps = {
  badge: 'Powerful Capabilities',
  title: 'Everything you need to deliver high-impact results',
  description:
    'Explore our comprehensive suite of modular, lightning-fast features designed to accelerate your productivity.',
  columns: 3,
  items: [
    {
      id: '1',
      title: 'Ultra-Fast Performance',
      description:
        'Engineered from the ground up for sub-millisecond execution and seamless interactivity.',
      icon: 'Zap',
      linkText: 'Learn more',
      linkUrl: '#performance',
    },
    {
      id: '2',
      title: 'Enterprise Security',
      description:
        'End-to-end encryption and bank-grade compliance baked into every layer of our platform.',
      icon: 'Shield',
      linkText: 'Learn more',
      linkUrl: '#security',
    },
    {
      id: '3',
      title: 'Intelligent Automation',
      description:
        'Automate complex workflows and eliminate repetitive tasks with smart orchestration.',
      icon: 'Cpu',
      linkText: 'Learn more',
      linkUrl: '#automation',
    },
    {
      id: '4',
      title: 'Global Edge Scale',
      description: 'Deploy seamlessly to over 300 edge locations with zero operational overhead.',
      icon: 'Globe',
      linkText: 'Learn more',
      linkUrl: '#scale',
    },
    {
      id: '5',
      title: 'Deep Analytics',
      description: 'Gain actionable real-time insights with intuitive visualization dashboards.',
      icon: 'BarChart',
      linkText: 'Learn more',
      linkUrl: '#analytics',
    },
    {
      id: '6',
      title: 'Developer Friendly',
      description: 'Robust REST & GraphQL APIs with first-class TypeScript SDKs and instant setup.',
      icon: 'Code',
      linkText: 'Learn more',
      linkUrl: '#api',
    },
  ],
};

export const defaultFeaturesStyle: ResponsiveSectionStyle = {
  desktop: {
    backgroundColor: '#f8fafc',
    paddingTop: '80px',
    paddingBottom: '80px',
    paddingLeft: '24px',
    paddingRight: '24px',
    contentWidth: 'contained',
    textAlign: 'center',
  },
};

export const defaultFeaturesActions: Record<string, ActionConfig> = {
  featureClickAction: {
    type: 'navigate',
  },
};
