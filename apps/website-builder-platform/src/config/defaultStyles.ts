import type { ResponsiveSectionStyle } from '@repo/component-library';

export const PLATFORM_DEFAULT_STYLES: Record<string, ResponsiveSectionStyle> = {
  hero: {
    desktop: {
      backgroundColor: '#ffffff',
      paddingTop: '96px',
      paddingBottom: '96px',
      paddingLeft: '24px',
      paddingRight: '24px',
      contentWidth: 'contained',
      alignment: 'left',
      headingColor: '#0f172a',
      bodyColor: '#475569',
    },
  },
  header: {
    desktop: {
      backgroundColor: '#ffffff',
      paddingTop: '16px',
      paddingBottom: '16px',
      paddingLeft: '24px',
      paddingRight: '24px',
      borderWidth: '1px',
      borderColor: '#f1f5f9',
      contentWidth: 'contained',
    },
  },
  footer: {
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
  },
  features: {
    desktop: {
      backgroundColor: '#f8fafc',
      paddingTop: '80px',
      paddingBottom: '80px',
      paddingLeft: '24px',
      paddingRight: '24px',
      contentWidth: 'contained',
      textAlign: 'center',
    },
  },
  faq: {
    desktop: {
      backgroundColor: '#ffffff',
      paddingTop: '88px',
      paddingBottom: '88px',
      paddingLeft: '24px',
      paddingRight: '24px',
      contentWidth: 'narrow',
      textAlign: 'center',
    },
  },
  pricing: {
    desktop: {
      backgroundColor: '#ffffff',
      paddingTop: '96px',
      paddingBottom: '96px',
      paddingLeft: '24px',
      paddingRight: '24px',
      contentWidth: 'contained',
      textAlign: 'center',
    },
  },
  testimonials: {
    desktop: {
      backgroundColor: '#f8fafc',
      paddingTop: '88px',
      paddingBottom: '88px',
      paddingLeft: '24px',
      paddingRight: '24px',
      contentWidth: 'contained',
      textAlign: 'center',
    },
  },
  contact: {
    desktop: {
      backgroundColor: '#ffffff',
      paddingTop: '88px',
      paddingBottom: '88px',
      paddingLeft: '24px',
      paddingRight: '24px',
      contentWidth: 'contained',
      textAlign: 'left',
    },
  },
  carousel: {
    desktop: {
      backgroundColor: '#ffffff',
      paddingTop: '80px',
      paddingBottom: '80px',
      paddingLeft: '24px',
      paddingRight: '24px',
      contentWidth: 'contained',
      textAlign: 'center',
    },
  },
};

export const FALLBACK_DEFAULT_STYLE: ResponsiveSectionStyle = {
  desktop: {
    backgroundColor: '#ffffff',
    paddingTop: '64px',
    paddingBottom: '64px',
    paddingLeft: '24px',
    paddingRight: '24px',
    contentWidth: 'contained',
  },
};
