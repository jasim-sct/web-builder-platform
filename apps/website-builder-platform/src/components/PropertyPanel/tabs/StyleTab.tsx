import React from 'react';

import { useEditor } from '../../../state/editorContext';
import { BackgroundControl } from '../controls/BackgroundControl';
import { BorderShadowControl } from '../controls/BorderShadowControl';
import { LayoutAlignmentControl } from '../controls/LayoutAlignmentControl';
import { TypographyControl } from '../controls/TypographyControl';
import { WSDndSpacerControl } from '../controls/WSDndSpacerControl';

import type { SectionInstance, SectionStyle } from '@repo/component-library';

interface StyleTabProps {
  section: SectionInstance;
}

export const StyleTab: React.FC<StyleTabProps> = ({ section }) => {
  const { updateSectionStyle } = useEditor();
  const currentDesktopStyle = section.style?.desktop || {};

  const handleStyleChange = (updatedPartial: Partial<SectionStyle>) => {
    updateSectionStyle(section.id, {
      ...section.style,
      desktop: {
        ...currentDesktopStyle,
        ...updatedPartial,
      },
    });
  };

  return (
    <>
      {/* Visual Box-Model Spacer (Margin & Padding) */}
      <WSDndSpacerControl style={currentDesktopStyle} onChange={handleStyleChange} />

      <div style={{ height: '1px', backgroundColor: '#272d3d', margin: '4px 0' }} />

      {/* Layout & Alignment */}
      <LayoutAlignmentControl style={currentDesktopStyle} onChange={handleStyleChange} />

      <div style={{ height: '1px', backgroundColor: '#272d3d', margin: '4px 0' }} />

      {/* Typography & Colors */}
      <TypographyControl style={currentDesktopStyle} onChange={handleStyleChange} />

      <div style={{ height: '1px', backgroundColor: '#272d3d', margin: '4px 0' }} />

      {/* Background & Effects */}
      <BackgroundControl style={currentDesktopStyle} onChange={handleStyleChange} />

      <div style={{ height: '1px', backgroundColor: '#272d3d', margin: '4px 0' }} />

      {/* Borders & Shadows */}
      <BorderShadowControl style={currentDesktopStyle} onChange={handleStyleChange} />
    </>
  );
};
