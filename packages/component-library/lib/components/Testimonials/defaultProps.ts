import type { ActionConfig } from '../../types';
import type { TestimonialsProps } from './types';

export const defaultTestimonialsProps: TestimonialsProps = {
  badge: 'Customer Stories',
  title: 'Loved by forward-thinking teams across the globe',
  description:
    'Hear directly from engineering leaders, product designers, and founders transforming their web workflows.',
  items: [
    {
      id: '1',
      quote:
        'This component architecture completely revolutionized our product velocity. We shipped our new SaaS landing pages in days instead of weeks.',
      authorName: 'Sarah Jenkins',
      authorRole: 'VP of Engineering at CloudScale',
      authorAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
    {
      id: '2',
      quote:
        'The separation of Props, Styles, and Actions is pure genius. Our marketing team can configure pages easily without breaking design consistency.',
      authorName: 'Alex Rivera',
      authorRole: 'Lead Product Designer at FinTech Hub',
      authorAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
    {
      id: '3',
      quote:
        'Flawless responsive behavior, clean TypeScript typings, and zero bloat. It has become our indispensable standard for all new client projects.',
      authorName: 'Elena Rostova',
      authorRole: 'CTO at Apex Digital Studio',
      authorAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
    },
  ],
};

export const defaultTestimonialsActions: Record<string, ActionConfig> = {
  testimonialClickAction: {
    type: 'custom',
  },
};
