import type { BaseSectionProps } from '../../types';

export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  rating?: number;
}

export interface TestimonialsProps {
  badge?: string;
  title: string;
  description?: string;
  items: TestimonialItem[];
}

export type TestimonialsComponentProps = BaseSectionProps<TestimonialsProps>;
