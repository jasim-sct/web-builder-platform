export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -2px rgba(0, 0, 0, 0.25)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.25)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
  floating: '0 16px 24px -4px rgba(0, 0, 0, 0.6), 0 8px 12px -4px rgba(0, 0, 0, 0.4)',
  glow: '0 0 16px rgba(59, 130, 246, 0.35)',
  inner: 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.25)',
} as const;

export type Shadows = typeof shadows;
