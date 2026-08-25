import type { BaseSectionProps } from '../../types';

export interface CarouselSlideItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  imageAlt?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface CarouselProps {
  badge?: string;
  title: string;
  description?: string;
  autoplay: boolean;
  interval: number;
  items: CarouselSlideItem[];
}

export type CarouselComponentProps = BaseSectionProps<CarouselProps>;
