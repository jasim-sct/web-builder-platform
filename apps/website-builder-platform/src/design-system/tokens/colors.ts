export const colors = {
  // Theme Surfaces (Studio Dark Theme)
  bg: {
    app: '#0f1117',
    surface1: '#181b24',
    surface2: '#212634',
    surface3: '#2c3244',
    surfaceHover: '#333a4f',
    surfaceActive: '#3b435c',
    canvas: '#f0f2f5',
    canvasDot: '#d8dde6',
    glassPanel: 'rgba(24, 27, 36, 0.92)',
    glassHeader: 'rgba(33, 38, 52, 0.95)',
    modalOverlay: 'rgba(5, 7, 12, 0.75)',
  },

  // Text Colors
  text: {
    primary: '#f8fafc',
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
    light: 'rgba(59, 130, 246, 0.15)',
    glow: 'rgba(59, 130, 246, 0.35)',
    subtle: 'rgba(59, 130, 246, 0.08)',
  },

  // Status & Semantic Colors
  status: {
    success: '#10b981',
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: '#f59e0b',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    danger: '#ef4444',
    dangerBg: 'rgba(239, 68, 68, 0.15)',
    info: '#06b6d4',
    infoBg: 'rgba(6, 182, 212, 0.15)',
    purple: '#8b5cf6',
    purpleBg: 'rgba(139, 92, 246, 0.15)',
  },

  // Borders & Dividers
  border: {
    subtle: '#272d3d',
    medium: '#3b445c',
    strong: '#4f5b7c',
    highlight: '#3b82f6',
    glass: 'rgba(255, 255, 255, 0.08)',
    focus: 'rgba(59, 130, 246, 0.5)',
  },
} as const;

export type Colors = typeof colors;
