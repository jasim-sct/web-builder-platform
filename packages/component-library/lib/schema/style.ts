import { colorProp, selectProp, textProp } from './properties';

import type { PropertySchema } from './types';

export const standardStyleSchema: Record<string, PropertySchema> = {
  // Layout
  alignment: selectProp(
    'alignment',
    'Alignment',
    [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ],
    'center',
    { category: 'style', responsive: true },
  ),
  contentWidth: selectProp(
    'contentWidth',
    'Content Width',
    [
      { label: 'Contained (1200px)', value: 'contained' },
      { label: 'Narrow (800px)', value: 'narrow' },
      { label: 'Wide (1440px)', value: 'wide' },
      { label: 'Full Width', value: 'full' },
    ],
    'contained',
    { category: 'style', responsive: true },
  ),

  // Spacing
  paddingTop: textProp('paddingTop', 'Padding Top', '80px', {
    category: 'style',
    responsive: true,
  }),
  paddingBottom: textProp('paddingBottom', 'Padding Bottom', '80px', {
    category: 'style',
    responsive: true,
  }),
  paddingLeft: textProp('paddingLeft', 'Padding Left', '24px', {
    category: 'style',
    responsive: true,
  }),
  paddingRight: textProp('paddingRight', 'Padding Right', '24px', {
    category: 'style',
    responsive: true,
  }),

  // Typography
  headingColor: colorProp('headingColor', 'Heading Color', '#0f172a', {
    category: 'style',
  }),
  bodyColor: colorProp('bodyColor', 'Body Text Color', '#475569', {
    category: 'style',
  }),
  accentColor: colorProp('accentColor', 'Accent Color', '#3b82f6', {
    category: 'style',
  }),
  textAlign: selectProp(
    'textAlign',
    'Text Alignment',
    [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ],
    'left',
    { category: 'style', responsive: true },
  ),

  // Background
  backgroundColor: colorProp('backgroundColor', 'Background Color', '#ffffff', {
    category: 'style',
  }),
  backgroundImage: textProp('backgroundImage', 'Background Image URL', '', {
    category: 'style',
  }),
  backgroundOverlay: textProp(
    'backgroundOverlay',
    'Background Overlay (e.g. rgba(0,0,0,0.5))',
    '',
    { category: 'style' },
  ),

  // Border
  borderWidth: textProp('borderWidth', 'Border Width', '0px', {
    category: 'style',
  }),
  borderColor: colorProp('borderColor', 'Border Color', '#e2e8f0', {
    category: 'style',
  }),
  borderRadius: textProp('borderRadius', 'Border Radius', '0px', {
    category: 'style',
  }),

  // Effects
  boxShadow: selectProp(
    'boxShadow',
    'Shadow',
    [
      { label: 'None', value: 'none' },
      { label: 'Small', value: 'sm' },
      { label: 'Medium', value: 'md' },
      { label: 'Large', value: 'lg' },
      { label: 'Extra Large', value: 'xl' },
    ],
    'none',
    { category: 'style' },
  ),
};
