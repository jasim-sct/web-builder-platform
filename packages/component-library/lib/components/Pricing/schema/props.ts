import {
  arrayProp,
  booleanProp,
  numberProp,
  textareaProp,
  textProp,
} from '../../../schema/properties';

import type { PropertySchema } from '../../../schema/types';

export const pricingPropsSchema: Record<string, PropertySchema> = {
  badge: textProp('badge', 'Badge Text', 'Transparent Pricing'),
  title: textProp('title', 'Pricing Title', 'Predictable plans tailored to your growth', {
    required: true,
  }),
  description: textareaProp('description', 'Description', ''),
  showBillingToggle: booleanProp('showBillingToggle', 'Show Monthly/Annual Toggle', true),
  annualDiscountText: textProp('annualDiscountText', 'Discount Badge Text', 'Save 20% with Annual'),
  plans: arrayProp(
    'plans',
    'Pricing Tiers',
    {
      name: textProp('name', 'Plan Name', 'Starter'),
      priceMonthly: numberProp('priceMonthly', 'Monthly Price', 29),
      priceAnnual: numberProp('priceAnnual', 'Annual Monthly Price', 24),
      currency: textProp('currency', 'Currency Symbol', '$'),
      description: textProp('description', 'Plan Description', 'Plan target audience'),
      isHighlighted: booleanProp('isHighlighted', 'Highlight Card', false),
      badge: textProp('badge', 'Highlight Badge Text', 'Popular'),
      ctaLabel: textProp('ctaLabel', 'CTA Label', 'Select Plan'),
      ctaUrl: textProp('ctaUrl', 'CTA URL', '#'),
    },
    [],
  ),
};
