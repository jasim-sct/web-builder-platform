import type { BaseSectionProps } from '../../types';

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  description: string;
  isHighlighted?: boolean;
  badge?: string;
  features: string[];
  ctaLabel: string;
  ctaUrl?: string;
}

export interface PricingProps {
  badge?: string;
  title: string;
  description?: string;
  showBillingToggle: boolean;
  annualDiscountText?: string;
  plans: PricingPlan[];
}

export type PricingComponentProps = BaseSectionProps<PricingProps>;
