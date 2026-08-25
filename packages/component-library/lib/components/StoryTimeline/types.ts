
import type { BaseSectionProps } from '../../types';
export interface StoryTimelineProps {
  title?: string;
  e1Year?: string;
  e1Title?: string;
  e1Desc?: string;
  e2Year?: string;
  e2Title?: string;
  e2Desc?: string;
  e3Year?: string;
  e3Title?: string;
  e3Desc?: string;
}
export interface StoryTimelineComponentProps extends BaseSectionProps<StoryTimelineProps> {}
