
import type { BaseSectionProps } from '../../types';
export interface EventScheduleProps {
  title?: string;
  e1Time?: string; e1Title?: string; e1Desc?: string;
  e2Time?: string; e2Title?: string; e2Desc?: string;
  e3Time?: string; e3Title?: string; e3Desc?: string;
}
export interface EventScheduleComponentProps extends BaseSectionProps<EventScheduleProps> {}
