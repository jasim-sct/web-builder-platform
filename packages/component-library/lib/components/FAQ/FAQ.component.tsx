import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { defaultFAQActions, defaultFAQProps } from './defaultProps';
import { getFAQStyles } from './helpers/styleHelper';

import type { FAQComponentProps, FAQItem } from './types';

export const FAQ: React.FC<FAQComponentProps> = ({
  id,
  props: userProps,
  style,
  actions: userActions,
  className = '',
  onAction,
}) => {
  const props = { ...defaultFAQProps, ...userProps };
  const actions = { ...defaultFAQActions, ...userActions };
  const { className: faqStyleClass, style: inlineStyle } = getFAQStyles(style);

  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    '1': true, // First item open by default
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    props.items?.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [props.items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return props.items || [];
    return (props.items || []).filter((item) => item.category === selectedCategory);
  }, [props.items, selectedCategory]);

  const toggleItem = (item: FAQItem) => {
    const isCurrentlyOpen = !!openIds[item.id];
    setOpenIds((prev) => ({
      ...prev,
      [item.id]: !isCurrentlyOpen,
    }));

    if (actions.faqToggleAction && onAction) {
      onAction('faqToggleAction', {
        ...actions.faqToggleAction,
        payload: {
          itemId: item.id,
          question: item.question,
          isOpen: !isCurrentlyOpen,
        },
      });
    }
  };

  return (
    <section
      id={id}
      className={`sec-faq-wrapper ${className}`}
      style={inlineStyle}
      role="region"
      aria-label="FAQ Section"
    >
      <div className={`sec-container ${faqStyleClass}`}>
        {/* Section Header */}
        <div className="sec-faq__header">
          {props.badge && <div className="sec-badge">{props.badge}</div>}
          <h2 className="sec-heading-2 sec-faq__title">{props.title}</h2>
          {props.description && (
            <p className="sec-body-lg sec-faq__description">{props.description}</p>
          )}

          {/* Category Filter Tabs */}
          {props.showCategoryFilter && categories.length > 2 && (
            <div className="sec-faq__categories" role="tablist">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`sec-faq__category-btn ${selectedCategory === cat ? 'sec-faq__category-btn--active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FAQ Accordion List */}
        <div className="sec-faq__list" role="presentation">
          {filteredItems.map((item) => {
            const isOpen = !!openIds[item.id];
            const contentId = `faq-content-${item.id}`;
            const headerId = `faq-header-${item.id}`;

            return (
              <div key={item.id} className={`sec-faq__item ${isOpen ? 'sec-faq__item--open' : ''}`}>
                <button
                  type="button"
                  id={headerId}
                  className="sec-faq__question-btn"
                  onClick={() => toggleItem(item)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <span className="sec-faq__question-text">{item.question}</span>
                  <ChevronDown
                    size={20}
                    className={`sec-faq__chevron ${isOpen ? 'sec-faq__chevron--rotated' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="sec-faq__answer"
                  >
                    <p className="sec-body-md sec-faq__answer-text">{item.answer}</p>
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

export default FAQ;
