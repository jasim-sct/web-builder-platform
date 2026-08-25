
import React from 'react';
import { Section } from '../common/Section';
import { defaultQuoteMessageProps } from './defaultProps';
import type { QuoteMessageComponentProps } from './types';

export const QuoteMessage: React.FC<QuoteMessageComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultQuoteMessageProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-quote-message-wrapper ${className}`}>
      <div className="sec-quote-message__container">
        <blockquote className="sec-quote-message__blockquote">
          <p className="sec-quote-message__text">"{props.quote}"</p>
          {props.author && <footer className="sec-quote-message__author">— {props.author}</footer>}
        </blockquote>
      </div>
    </Section>
  );
};
export default QuoteMessage;
