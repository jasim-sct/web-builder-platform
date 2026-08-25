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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* Visual Box-Model Spacer (Margin & Padding) */}
      <WSDndSpacerControl style={currentDesktopStyle} onChange={handleStyleChange} />

      <div className="ws-prop-divider" />

      {/* Layout & Alignment */}
      <LayoutAlignmentControl style={currentDesktopStyle} onChange={handleStyleChange} />

      <div className="ws-prop-divider" />

      {/* Typography & Colors */}
      <TypographyControl style={currentDesktopStyle} onChange={handleStyleChange} />

      <div className="ws-prop-divider" />

      {/* Background & Effects */}
      <BackgroundControl style={currentDesktopStyle} onChange={handleStyleChange} />

      <div className="ws-prop-divider" />

      {/* Borders & Shadows */}
      <BorderShadowControl style={currentDesktopStyle} onChange={handleStyleChange} />
    </div>
  );
};
