export const zIndex = {
  canvas: 1,
  sectionControls: 10,
  dropdown: 15,
  propertyPanel: 20,
  floatingPalette: 35,
  header: 40,
  modalOverlay: 50,
  modal: 51,
  toast: 60,
  tooltip: 70,
} as const;

export type ZIndex = typeof zIndex;
