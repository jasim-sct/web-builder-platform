import type { ActionConfig, ResponsiveSectionStyle } from '../../types';
import type { FooterProps } from './types';

export const defaultFooterProps: FooterProps = {
  logoText: 'Acme Corp',
  logoImage: '',
  description:
    'The premier developer platform for building, deploying, and scaling modern web applications with speed and precision.',
  linkGroups: [
    {
      id: 'product',
      title: 'Product',
      links: [
        { id: '1', label: 'Features', href: '#features' },
        { id: '2', label: 'Pricing', href: '#pricing' },
        { id: '3', label: 'Integrations', href: '#integrations' },
        { id: '4', label: 'Changelog', href: '#changelog' },
      ],
    },
    {
      id: 'resources',
      title: 'Resources',
      links: [
        { id: '1', label: 'Documentation', href: '#docs' },
        { id: '2', label: 'API Reference', href: '#api' },
        { id: '3', label: 'Community', href: '#community' },
        { id: '4', label: 'Guides & Tutorials', href: '#guides' },
      ],
    },
    {
      id: 'company',
      title: 'Company',
      links: [
        { id: '1', label: 'About Us', href: '#about' },
        { id: '2', label: 'Careers (Hiring!)', href: '#careers' },
        { id: '3', label: 'Blog', href: '#blog' },
        { id: '4', label: 'Contact', href: '#contact' },
      ],
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { id: '1', label: 'Privacy Policy', href: '#privacy' },
        { id: '2', label: 'Terms of Service', href: '#terms' },
        { id: '3', label: 'Security Overview', href: '#security' },
        { id: '4', label: 'Cookie Settings', href: '#cookies' },
      ],
    },
  ],
  socialLinks: [
    { id: '1', platform: 'twitter', url: 'https://twitter.com' },
    { id: '2', platform: 'github', url: 'https://github.com' },
    { id: '3', platform: 'linkedin', url: 'https://linkedin.com' },
    { id: '4', platform: 'discord', url: 'https://discord.com' },
  ],
  copyrightText: '© 2026 Acme Corp. All rights reserved.',
  showNewsletter: true,
  newsletterTitle: 'Stay up to date with product releases',
  newsletterButtonText: 'Subscribe',
};

export const defaultFooterStyle: ResponsiveSectionStyle = {
  desktop: {
    backgroundColor: '#090d16',
    paddingTop: '80px',
    paddingBottom: '48px',
    paddingLeft: '24px',
    paddingRight: '24px',
    contentWidth: 'contained',
    headingColor: '#ffffff',
    bodyColor: '#94a3b8',
  },
};

export const defaultFooterActions: Record<string, ActionConfig> = {
  newsletterSubmitAction: {
    type: 'submitApi',
    url: '/api/newsletter',
  },
  footerLinkAction: {
    type: 'navigate',
  },
};
