import type { BaseSectionProps } from '../../types';

export interface FooterLinkItem {
  id: string;
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  id: string;
  title: string;
  links: FooterLinkItem[];
}

export interface FooterSocialLink {
  id: string;
  platform: 'twitter' | 'github' | 'linkedin' | 'discord' | 'youtube';
  url: string;
}

export interface FooterProps {
  logoText: string;
  logoImage?: string;
  description: string;
  linkGroups: FooterLinkGroup[];
  socialLinks: FooterSocialLink[];
  copyrightText: string;
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterButtonText?: string;
}

export type FooterComponentProps = BaseSectionProps<FooterProps>;
