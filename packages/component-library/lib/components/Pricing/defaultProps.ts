import type { ActionConfig, ResponsiveSectionStyle } from '../../types';
import type { PricingProps } from './types';

export const defaultPricingProps: PricingProps = {
  badge: 'Transparent Pricing',
  title: 'Predictable plans tailored to your growth',
  description:
    'Choose the perfect plan for your business needs. Upgrade, downgrade, or cancel anytime with zero lock-in.',
  showBillingToggle: true,
  annualDiscountText: 'Save 20% with Annual',
  plans: [
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 29,
      priceAnnual: 24,
      currency: '$',
      description: 'Ideal for early-stage startups and solo developers.',
      isHighlighted: false,
      features: [
        'Up to 5 team members',
        '10 custom domains',
        'Standard CDN & SSL',
        'Community support',
        'Weekly automated backups',
      ],
      ctaLabel: 'Start Starter Plan',
      ctaUrl: '#starter',
    },
    {
      id: 'pro',
      name: 'Professional',
      priceMonthly: 79,
      priceAnnual: 64,
      currency: '$',
      description: 'Perfect for fast-growing companies and high-traffic sites.',
      isHighlighted: true,
      badge: 'Most Popular',
      features: [
        'Unlimited team members',
        'Unlimited custom domains',
        'Global edge cache acceleration',
        'Priority 24/7 support',
        'Daily automated backups',
        'Advanced analytics & reporting',
        'Custom SSO / SAML',
      ],
      ctaLabel: 'Start Pro Trial',
      ctaUrl: '#pro',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      priceMonthly: 199,
      priceAnnual: 159,
      currency: '$',
      description: 'Dedicated infrastructure, custom SLAs, and VIP support.',
      isHighlighted: false,
      features: [
        'Dedicated isolated clusters',
        '99.99% uptime SLA guarantee',
        'Dedicated account manager',
        'Custom security & audit logs',
        'Real-time streaming backups',
        'Custom integrations & webhooks',
      ],
      ctaLabel: 'Contact Sales',
      ctaUrl: '#enterprise',
    },
  ],
};

export const defaultPricingStyle: ResponsiveSectionStyle = {
  desktop: {
    backgroundColor: '#ffffff',
    paddingTop: '96px',
    paddingBottom: '96px',
    paddingLeft: '24px',
    paddingRight: '24px',
    contentWidth: 'contained',
    textAlign: 'center',
  },
};

export const defaultPricingActions: Record<string, ActionConfig> = {
  planSelectAction: {
    type: 'navigate',
  },
};
