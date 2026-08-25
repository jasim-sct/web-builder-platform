import { getContentWidthClass, resolveSectionStyles } from '../../../helpers/styleResolver';

import type React from 'react';
import type { ResponsiveSectionStyle } from '../../../types';

export function getFAQStyles(style?: ResponsiveSectionStyle): {
  className: string;
  style: React.CSSProperties;
} {
  return {
    className: `sec-faq ${getContentWidthClass(style)}`,
    style: resolveSectionStyles(style),
  };
}
