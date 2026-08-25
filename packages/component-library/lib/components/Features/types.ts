import type { BaseSectionProps } from '../../types';

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  linkText?: string;
  linkUrl?: string;
  link?: string;
}

export interface FeaturesProps {
  badge?: string;
  title: string;
  description?: string;
  columns: 2 | 3 | 4;
  items: FeatureItem[];
}

export type FeaturesComponentProps = BaseSectionProps<FeaturesProps>;
