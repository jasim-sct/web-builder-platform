import React from 'react';
import { ArrowRight, CheckCircle2, Cpu, Globe, Layers, Lock, Sparkles, Zap } from 'lucide-react';

import { defaultFeaturesActions, defaultFeaturesProps } from './defaultProps';
import { getFeaturesStyles } from './helpers/styleHelper';

import type { FeaturesComponentProps } from './types';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  zap: Zap,
  lock: Lock,
  globe: Globe,
  layers: Layers,
  sparkles: Sparkles,
  cpu: Cpu,
};

export const Features: React.FC<FeaturesComponentProps> = ({
  id,
  props: userProps,
  style,
  actions: userActions,
  className = '',
  onAction,
}) => {
  const props = { ...defaultFeaturesProps, ...userProps };
  const actions = { ...defaultFeaturesActions, ...userActions };
  const { className: featureStyleClass, style: inlineStyle } = getFeaturesStyles(style);

  const columnClass = `sec-features__grid--cols-${props.columns || 3}`;

  const handleFeatureClick = (item: (typeof props.items)[0], e: React.MouseEvent) => {
    if (actions.featureClickAction) {
      if (onAction) {
        e.preventDefault();
        onAction('featureClickAction', {
          ...actions.featureClickAction,
          target: item.link || undefined,
          payload: { itemId: item.id, title: item.title },
        });
      } else if (item.link) {
        window.location.href = item.link;
      }
    }
  };

  return (
    <section
      id={id}
      className={`sec-features-wrapper ${className}`}
      style={inlineStyle}
      role="region"
      aria-label="Features Section"
    >
      <div className={`sec-container ${featureStyleClass}`}>
        {/* Section Header */}
        <div className="sec-features__header">
          {props.badge && <div className="sec-badge">{props.badge}</div>}
          <h2 className="sec-heading-2 sec-features__title">{props.title}</h2>
          {props.description && (
            <p className="sec-body-lg sec-features__description">{props.description}</p>
          )}
        </div>

        {/* Features Grid */}
        <div className={`sec-features__grid ${columnClass}`}>
          {props.items?.map((item) => {
            const IconComponent = (item.icon && iconMap[item.icon.toLowerCase()]) || CheckCircle2;

            return (
              <div
                key={item.id}
                className="sec-features__card"
                onClick={(e) => handleFeatureClick(item, e)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleFeatureClick(item, e as unknown as React.MouseEvent);
                  }
                }}
              >
                <div className="sec-features__card-icon">
                  <IconComponent size={24} className="sec-features__icon" />
                </div>

                <h3 className="sec-heading-3 sec-features__card-title">{item.title}</h3>
                <p className="sec-body-md sec-features__card-description">{item.description}</p>

                {item.linkText && (
                  <div className="sec-features__card-link">
                    <span>{item.linkText}</span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
