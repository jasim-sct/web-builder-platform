import { describe, expect, it } from 'vitest';

import { editorReducer, initialEditorState } from '../src/state/editorReducer';

describe('editorReducer', () => {
  it('should return the initial state by default', () => {
    const state = editorReducer(initialEditorState, { type: 'HOVER_SECTION', sectionId: null });
    expect(state.page.sections).toHaveLength(0);
    expect(state.selectedSectionId).toBeNull();
  });

  it('should add a section into the page tree', () => {
    const state1 = editorReducer(initialEditorState, {
      type: 'ADD_SECTION',
      componentId: 'hero',
    });

    expect(state1.page.sections).toHaveLength(1);
    expect(state1.page.sections[0]?.componentId).toBe('hero');
    expect(state1.selectedSectionId).toBe(state1.page.sections[0]?.id);

    // Add another section at specific index
    const state2 = editorReducer(state1, {
      type: 'ADD_SECTION',
      componentId: 'features',
      targetIndex: 0,
    });

    expect(state2.page.sections).toHaveLength(2);
    expect(state2.page.sections[0]?.componentId).toBe('features');
    expect(state2.page.sections[1]?.componentId).toBe('hero');
  });

  it('should remove a section and clear selection if removed', () => {
    const state1 = editorReducer(initialEditorState, {
      type: 'ADD_SECTION',
      componentId: 'pricing',
    });
    const sectionId = state1.page.sections[0]!.id;

    const state2 = editorReducer(state1, {
      type: 'REMOVE_SECTION',
      sectionId,
    });

    expect(state2.page.sections).toHaveLength(0);
    expect(state2.selectedSectionId).toBeNull();
  });

  it('should duplicate a section with new unique ID and same props', () => {
    const state1 = editorReducer(initialEditorState, {
      type: 'ADD_SECTION',
      componentId: 'hero',
    });
    const sectionId = state1.page.sections[0]!.id;

    const state2 = editorReducer(state1, {
      type: 'DUPLICATE_SECTION',
      sectionId,
    });

    expect(state2.page.sections).toHaveLength(2);
    expect(state2.page.sections[0]?.componentId).toBe('hero');
    expect(state2.page.sections[1]?.componentId).toBe('hero');
    expect(state2.page.sections[0]?.id).not.toBe(state2.page.sections[1]?.id);
    expect(state2.selectedSectionId).toBe(state2.page.sections[1]?.id);
  });

  it('should move a section up and down', () => {
    let state = editorReducer(initialEditorState, { type: 'ADD_SECTION', componentId: 'header' });
    state = editorReducer(state, { type: 'ADD_SECTION', componentId: 'hero' });
    state = editorReducer(state, { type: 'ADD_SECTION', componentId: 'footer' });

    expect(state.page.sections.map((s) => s.componentId)).toEqual(['header', 'hero', 'footer']);

    const heroId = state.page.sections[1]!.id;
    state = editorReducer(state, { type: 'MOVE_SECTION', sectionId: heroId, direction: 'up' });
    expect(state.page.sections.map((s) => s.componentId)).toEqual(['hero', 'header', 'footer']);

    state = editorReducer(state, { type: 'MOVE_SECTION', sectionId: heroId, direction: 'down' });
    expect(state.page.sections.map((s) => s.componentId)).toEqual(['header', 'hero', 'footer']);
  });

  it('should reorder sections from source to destination index', () => {
    let state = editorReducer(initialEditorState, { type: 'ADD_SECTION', componentId: 'header' });
    state = editorReducer(state, { type: 'ADD_SECTION', componentId: 'hero' });
    state = editorReducer(state, { type: 'ADD_SECTION', componentId: 'footer' });

    state = editorReducer(state, { type: 'REORDER_SECTIONS', sourceIndex: 2, destinationIndex: 0 });
    expect(state.page.sections.map((s) => s.componentId)).toEqual(['footer', 'header', 'hero']);
  });

  it('should update props, style, and actions immutably', () => {
    let state = editorReducer(initialEditorState, { type: 'ADD_SECTION', componentId: 'hero' });
    const heroId = state.page.sections[0]!.id;

    state = editorReducer(state, {
      type: 'UPDATE_SECTION_PROPS',
      sectionId: heroId,
      props: { title: 'Updated Title' },
    });
    expect((state.page.sections[0]?.props as Record<string, unknown>).title).toBe('Updated Title');

    state = editorReducer(state, {
      type: 'UPDATE_SECTION_STYLE',
      sectionId: heroId,
      style: { desktop: { backgroundColor: '#ff0000' } },
    });
    expect(state.page.sections[0]?.style?.desktop?.backgroundColor).toBe('#ff0000');

    state = editorReducer(state, {
      type: 'UPDATE_SECTION_ACTIONS',
      sectionId: heroId,
      actions: { primaryCta: { type: 'navigate', target: '/pricing' } },
    });
    expect(state.page.sections[0]?.actions?.primaryCta?.target).toBe('/pricing');
  });

  it('should handle component panel toggle, minimize, and position updates', () => {
    let state = editorReducer(initialEditorState, { type: 'TOGGLE_COMPONENT_PANEL' });
    expect(state.isComponentPanelOpen).toBe(false);

    state = editorReducer(state, { type: 'SET_COMPONENT_PANEL_OPEN', isOpen: true });
    expect(state.isComponentPanelOpen).toBe(true);

    state = editorReducer(state, { type: 'TOGGLE_COMPONENT_PANEL_MINIMIZE' });
    expect(state.isComponentPanelMinimized).toBe(true);

    state = editorReducer(state, {
      type: 'SET_COMPONENT_PANEL_POSITION',
      position: { x: 120, y: 80 },
    });
    expect(state.componentPanelPosition).toEqual({ x: 120, y: 80 });
  });
});
