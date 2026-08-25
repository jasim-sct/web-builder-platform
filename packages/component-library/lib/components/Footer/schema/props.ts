import {
  arrayProp,
  booleanProp,
  imageProp,
  textareaProp,
  textProp,
} from '../../../schema/properties';

import type { PropertySchema } from '../../../schema/types';

export const footerPropsSchema: Record<string, PropertySchema> = {
  logoText: textProp('logoText', 'Logo Text', 'Acme Corp', { required: true }),
  logoImage: imageProp('logoImage', 'Logo Image URL', ''),
  description: textareaProp('description', 'Company Short Bio', 'The premier developer platform.'),
  linkGroups: arrayProp(
    'linkGroups',
    'Footer Link Groups',
    {
      title: textProp('title', 'Group Title', 'Products'),
    },
    [],
  ),
  socialLinks: arrayProp(
    'socialLinks',
    'Social Links',
    {
      platform: textProp('platform', 'Platform Name', 'twitter'),
      url: textProp('url', 'Profile URL', 'https://twitter.com'),
    },
    [],
  ),
  copyrightText: textProp(
    'copyrightText',
    'Copyright Text',
    '© 2026 Acme Corp. All rights reserved.',
  ),
  showNewsletter: booleanProp('showNewsletter', 'Show Newsletter Box', true),
  newsletterTitle: textProp(
    'newsletterTitle',
    'Newsletter Title',
    'Stay up to date with product releases',
  ),
  newsletterButtonText: textProp('newsletterButtonText', 'Subscribe Button Text', 'Subscribe'),
};
