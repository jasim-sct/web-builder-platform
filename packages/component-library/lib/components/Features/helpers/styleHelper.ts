import { getContentWidthClass, resolveSectionStyles } from '../../../helpers/styleResolver';

import type React from 'react';
import type { ResponsiveSectionStyle } from '../../../types';

export function getFeaturesStyles(
  style?: ResponsiveSectionStyle,
  columns: number = 3,
): {
  className: string;
  style: React.CSSProperties;
} {
  return {
    className: `sec-features sec-features--cols-${columns} ${getContentWidthClass(style)}`,
    style: resolveSectionStyles(style),
  };
}
