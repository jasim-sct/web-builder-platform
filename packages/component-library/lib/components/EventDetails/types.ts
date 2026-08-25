
import type { BaseSectionProps } from '../../types';
export interface EventDetailsProps {
  title?: string;
  date?: string;
  time?: string;
  venueName?: string;
  address?: string;
}
export interface EventDetailsComponentProps extends BaseSectionProps<EventDetailsProps> {}
