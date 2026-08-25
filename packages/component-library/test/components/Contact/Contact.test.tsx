import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Contact } from '../../../lib/components/Contact';

describe('Contact Section Component', () => {
  it('renders contact details and form inputs', () => {
    render(<Contact />);

    expect(screen.getByText("Let's build something exceptional together")).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByText('contact@acmecorp.io')).toBeInTheDocument();
  });

  it('handles form typing and triggers submitAction on form submit', () => {
    const handleAction = vi.fn();
    render(<Contact onAction={handleAction} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Alex Morgan' },
    });
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: 'alex@startup.io' },
    });
    fireEvent.change(screen.getByLabelText(/project details/i), {
      target: { value: 'Interested in enterprise subscription.' },
    });

    const submitBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitBtn);

    expect(handleAction).toHaveBeenCalledWith(
      'submitAction',
      expect.objectContaining({
        type: 'submitApi',
        payload: expect.objectContaining({
          name: 'Alex Morgan',
          email: 'alex@startup.io',
        }),
      }),
    );
  });
});
