
import type { BaseSectionProps } from '../../types';
export interface OurStoryProps {
  title?: string;
  storyText?: string;
  image?: string;
}
export interface OurStoryComponentProps extends BaseSectionProps<OurStoryProps> {}
