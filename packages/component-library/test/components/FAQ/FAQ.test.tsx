import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FAQ } from '../../../lib/components/FAQ';

describe('FAQ Section Component', () => {
  it('renders FAQ questions and defaults first item open', () => {
    render(<FAQ />);

    expect(
      screen.getByText('How quickly can we deploy our website with this library?'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/with our pre-built section library and component schemas/i),
    ).toBeInTheDocument();
  });

  it('toggles accordion items open and closed on click', () => {
    render(<FAQ />);

    const secondQuestionBtn = screen.getByText(
      'Is the component code fully accessible and SEO-friendly?',
    );
    fireEvent.click(secondQuestionBtn);

    expect(
      screen.getByText(/Yes! Every section is constructed with semantic HTML5/i),
    ).toBeInTheDocument();
  });
});
