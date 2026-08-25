
import type { BaseSectionProps } from '../../types';
export interface CeremonyProps { title?: string; time?: string; location?: string; address?: string; image?: string; }
export interface CeremonyComponentProps extends BaseSectionProps<CeremonyProps> {}
