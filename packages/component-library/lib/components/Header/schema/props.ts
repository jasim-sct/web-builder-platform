import { arrayProp, booleanProp, imageProp, textProp } from '../../../schema/properties';

import type { PropertySchema } from '../../../schema/types';

export const headerPropsSchema: Record<string, PropertySchema> = {
  logoText: textProp('logoText', 'Logo Text', 'Acme Corp', { required: true }),
  logoImage: imageProp('logoImage', 'Logo Image URL', ''),
  links: arrayProp(
    'links',
    'Navigation Links',
    {
      label: textProp('label', 'Link Label', 'Link'),
      href: textProp('href', 'URL / Anchor', '#'),
    },
    [],
  ),
  ctaLabel: textProp('ctaLabel', 'CTA Button Label', 'Get Started'),
  showCta: booleanProp('showCta', 'Show CTA Button', true),
  sticky: booleanProp('sticky', 'Sticky Header', true),
};
