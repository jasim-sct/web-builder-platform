
import type { BaseSectionProps } from '../../types';
export interface CoupleHostsProps {
  title?: string;
  host1Name?: string;
  host1Bio?: string;
  host1Image?: string;
  host2Name?: string;
  host2Bio?: string;
  host2Image?: string;
}
export interface CoupleHostsComponentProps extends BaseSectionProps<CoupleHostsProps> {}
