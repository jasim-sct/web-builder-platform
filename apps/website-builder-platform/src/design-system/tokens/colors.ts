export const colors = {
  // Theme Surfaces (Studio Dark Theme)
  bg: {
    app: '#0c0e14',
    surface1: '#151820',
    surface2: '#1c2030',
    surface3: '#252a3a',
    surfaceHover: '#2e3448',
    surfaceActive: '#363e56',
    canvas: '#eef1f5',
    canvasDot: '#dde2ea',
    glassPanel: 'rgba(21, 24, 32, 0.94)',
    glassHeader: 'rgba(28, 32, 48, 0.96)',
    modalOverlay: 'rgba(4, 6, 10, 0.8)',
  },

  // Text Colors
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
    subtle: '#475569',
    inverse: '#0f172a',
    brand: '#60a5fa',
  },

  // Brand & Accent Colors
  primary: {
    DEFAULT: '#3b82f6',
    hover: '#2563eb',
    active: '#1d4ed8',
    light: 'rgba(59, 130, 246, 0.12)',
    glow: 'rgba(59, 130, 246, 0.3)',
    subtle: 'rgba(59, 130, 246, 0.06)',
  },

  // Status & Semantic Colors
  status: {
    success: '#22c55e',
    successBg: 'rgba(34, 197, 94, 0.12)',
    warning: '#eab308',
    warningBg: 'rgba(234, 179, 8, 0.12)',
    danger: '#ef4444',
    dangerBg: 'rgba(239, 68, 68, 0.12)',
    info: '#06b6d4',
    infoBg: 'rgba(6, 182, 212, 0.12)',
    purple: '#8b5cf6',
    purpleBg: 'rgba(139, 92, 246, 0.12)',
  },

  // Borders & Dividers
  border: {
    subtle: '#1e2536',
    medium: '#2a3348',
    strong: '#3e4a64',
    highlight: '#3b82f6',
    glass: 'rgba(255, 255, 255, 0.06)',
    focus: 'rgba(59, 130, 246, 0.5)',
  },
} as const;

export type Colors = typeof colors;
