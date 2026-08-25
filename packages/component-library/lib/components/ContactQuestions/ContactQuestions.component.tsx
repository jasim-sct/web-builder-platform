
import React from 'react';
import { Section } from '../common/Section';
import { defaultContactQuestionsProps } from './defaultProps';
import type { ContactQuestionsComponentProps } from './types';

export const ContactQuestions: React.FC<ContactQuestionsComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultContactQuestionsProps, ...userProps };
  const compKebab = "contact-questions";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-generic-card">
        <h2 className="sec-generic-card__title">{props.title}</h2>
        <p className="sec-generic-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default ContactQuestions;
