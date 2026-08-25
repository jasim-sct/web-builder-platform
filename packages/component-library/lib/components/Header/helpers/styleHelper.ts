import { getContentWidthClass, resolveSectionStyles } from '../../../helpers/styleResolver';

import type React from 'react';
import type { ResponsiveSectionStyle } from '../../../types';

export function getHeaderStyles(style?: ResponsiveSectionStyle): {
  className: string;
  style: React.CSSProperties;
} {
  return {
    className: `sec-header ${getContentWidthClass(style)}`,
    style: resolveSectionStyles(style),
  };
}
