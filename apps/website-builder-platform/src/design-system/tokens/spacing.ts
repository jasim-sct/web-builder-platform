export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
} as const;

export const layout = {
  headerHeight: '56px',
  propertyPanelWidth: '360px',
  propertyPanelExpandedWidth: '540px',
  floatingPaletteWidth: '330px',
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
