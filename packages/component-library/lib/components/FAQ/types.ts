import type { BaseSectionProps } from '../../types';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FAQProps {
  badge?: string;
  title: string;
  description?: string;
  showCategoryFilter?: boolean;
  items: FAQItem[];
}

export type FAQComponentProps = BaseSectionProps<FAQProps>;
