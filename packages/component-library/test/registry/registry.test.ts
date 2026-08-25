import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  getAllSections,
  getSection,
  getSectionsByCategory,
  getSectionSchema,
  renderSectionInstance,
} from '../../lib/main';

describe('Section Registry Engine', () => {
  it('registers and resolves all 9 foundational sections', () => {
    const sections = getAllSections();
    expect(sections.length).toBe(9);

    const ids = sections.map((s) => s.componentId);
    expect(ids).toContain('header');
    expect(ids).toContain('hero');
    expect(ids).toContain('features');
    expect(ids).toContain('carousel');
    expect(ids).toContain('pricing');
    expect(ids).toContain('testimonials');
    expect(ids).toContain('faq');
    expect(ids).toContain('contact');
    expect(ids).toContain('footer');
  });

  it('filters sections by category accurately', () => {
    const navigationSections = getSectionsByCategory('Navigation');
    expect(navigationSections.length).toBe(2);
    expect(navigationSections.map((s) => s.componentId)).toEqual(['header', 'footer']);

    const businessSections = getSectionsByCategory('Business');
    expect(businessSections.length).toBe(2);
    expect(businessSections.map((s) => s.componentId)).toEqual(['pricing', 'testimonials']);
  });

  it('returns valid schema with Props, Style, and Actions for any section', () => {
    const heroSchema = getSectionSchema('hero');
    expect(heroSchema).toBeDefined();
    expect(heroSchema?.props).toBeDefined();
    expect(heroSchema?.style).toBeDefined();
    expect(heroSchema?.actions).toBeDefined();

    expect(heroSchema?.props.title).toBeDefined();
    expect(heroSchema?.actions.primaryButtonAction).toBeDefined();
  });

  it('dynamically renders a SectionInstance via renderSectionInstance', () => {
    const heroItem = getSection('hero');
    expect(heroItem).toBeDefined();

    const instance = heroItem!.generator({
      props: {
        title: 'Dynamic Registry Hero Rendering',
      },
    });

    const rendered = renderSectionInstance(instance);
    expect(rendered).not.toBeNull();

    render(rendered!);
    expect(screen.getByText('Dynamic Registry Hero Rendering')).toBeInTheDocument();
  });
});
