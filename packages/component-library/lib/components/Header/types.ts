import type { BaseSectionProps } from '../../types';

export interface HeaderNavLink {
  id: string;
  label: string;
  href: string;
  target?: '_self' | '_blank';
}

export interface HeaderProps {
  logoText: string;
  logoImage?: string;
  links: HeaderNavLink[];
  ctaLabel: string;
  showCta: boolean;
  sticky: boolean;
}

export type HeaderComponentProps = BaseSectionProps<HeaderProps>;
