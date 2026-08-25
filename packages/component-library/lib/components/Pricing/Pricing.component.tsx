import React from 'react';
import { Section } from '../common/Section';
import { useState } from 'react';
import { Check } from 'lucide-react';

import { defaultPricingActions, defaultPricingProps } from './defaultProps';

import type { PricingComponentProps, PricingPlan } from './types';

export const Pricing: React.FC<PricingComponentProps> = ({
  id,
  props: userProps,
  style: userStyle,
  actions: userActions,
  className = '',
  onAction,
}) => {
  const props = { ...defaultPricingProps, ...userProps };
  const actions = { ...defaultPricingActions, ...userActions };
  

  const [isAnnual, setIsAnnual] = useState(false);

  const handlePlanSelect = (plan: PricingPlan, e: React.MouseEvent) => {
    if (actions.planSelectAction) {
      if (onAction) {
        e.preventDefault();
        onAction('planSelectAction', {
          ...actions.planSelectAction,
          target: plan.ctaUrl || plan.id,
          payload: {
            planId: plan.id,
            planName: plan.name,
            billingCycle: isAnnual ? 'annual' : 'monthly',
            price: isAnnual ? plan.priceAnnual : plan.priceMonthly,
          },
        });
      } else if (plan.ctaUrl) {
        window.location.href = plan.ctaUrl;
      }
    }
  };

  return (
    <Section
      id={id}
      className={`sec-pricing-wrapper ${className}`}
      style={userStyle}
      role="region"
      aria-label="Pricing Section"
    >
      <div className="sec-pricing">
        {/* Section Header */}
        <div className="sec-pricing__header">
          {props.badge && <div className="sec-badge">{props.badge}</div>}
          <h2 className="sec-heading-2 sec-pricing__title">{props.title}</h2>
          {props.description && (
            <p className="sec-body-lg sec-pricing__description">{props.description}</p>
          )}

          {/* Billing Cycle Toggle */}
          {props.showBillingToggle && (
            <div className="sec-pricing__toggle-wrapper">
              <span
                className={`sec-pricing__toggle-label ${!isAnnual ? 'sec-pricing__toggle-label--active' : ''}`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </span>

              <button
                type="button"
                className={`sec-pricing__toggle-switch ${isAnnual ? 'sec-pricing__toggle-switch--annual' : ''}`}
                onClick={() => setIsAnnual(!isAnnual)}
                aria-label="Toggle Monthly or Annual Billing"
                role="switch"
                aria-checked={isAnnual}
              >
                <div className="sec-pricing__toggle-thumb" />
              </button>

              <span
                className={`sec-pricing__toggle-label ${isAnnual ? 'sec-pricing__toggle-label--active' : ''}`}
                onClick={() => setIsAnnual(true)}
              >
                Annual
              </span>

              {props.annualDiscountText && (
                <span className="sec-pricing__discount-badge">{props.annualDiscountText}</span>
              )}
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="sec-pricing__grid">
          {props.plans?.map((plan) => {
            const currentPrice = isAnnual ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`sec-pricing__card ${plan.isHighlighted ? 'sec-pricing__card--highlighted' : ''}`}
              >
                {plan.badge && <div className="sec-pricing__card-badge">{plan.badge}</div>}

                <h3 className="sec-heading-3 sec-pricing__card-name">{plan.name}</h3>
                <p className="sec-body-sm sec-pricing__card-description">{plan.description}</p>

                <div className="sec-pricing__price-block">
                  <span className="sec-pricing__currency">{plan.currency}</span>
                  <span className="sec-pricing__amount">{currentPrice}</span>
                  <span className="sec-pricing__period">/ month</span>
                </div>

                <button
                  type="button"
                  className={`sec-btn ${plan.isHighlighted ? 'sec-btn--primary' : 'sec-btn--outline'} sec-btn--md sec-pricing__card-btn`}
                  onClick={(e) => handlePlanSelect(plan, e)}
                >
                  {plan.ctaLabel}
                </button>

                <div className="sec-pricing__features-divider" />

                <ul className="sec-pricing__features-list">
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="sec-pricing__feature-item">
                      <div className="sec-pricing__feature-icon">
                        <Check size={16} />
                      </div>
                      <span className="sec-body-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

export default Pricing;
