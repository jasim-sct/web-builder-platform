import { getContentWidthClass, resolveSectionStyles } from '../../../helpers/styleResolver';

import type React from 'react';
import type { ResponsiveSectionStyle } from '../../../types';

export function getCarouselStyles(style?: ResponsiveSectionStyle): {
  className: string;
  style: React.CSSProperties;
} {
  return {
    className: `sec-carousel ${getContentWidthClass(style)}`,
    style: resolveSectionStyles(style),
  };
}
