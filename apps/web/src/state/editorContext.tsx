import React, { createContext, useContext, useMemo, useReducer } from 'react';

import { getSection, getSectionSchema } from '@repo/component-library';

import { editorReducer, initialEditorState } from './editorReducer';

import type {
  ActionConfig,
  ResponsiveSectionStyle,
  SectionCategory,
  SectionInstance,
  SectionRegistryItem,
  SectionSchema,
} from '@repo/component-library';
import type { ReactNode } from 'react';
import type { EditorAction, EditorState, PropertyTab } from '../types/editor';

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  selectedSection: SectionInstance | null;
  selectedSectionItem: SectionRegistryItem | null;
  selectedSectionSchema: SectionSchema | null;
  addSection: (componentId: string, targetIndex?: number) => void;
  removeSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  reorderSections: (sourceIndex: number, destinationIndex: number) => void;
  selectSection: (sectionId: string | null, tab?: PropertyTab) => void;
  hoverSection: (sectionId: string | null) => void;
  setActiveDropIndex: (index: number | null) => void;
  updateSectionProps: (sectionId: string, props: Record<string, unknown>) => void;
  updateSectionStyle: (sectionId: string, style: ResponsiveSectionStyle) => void;
  updateSectionActions: (sectionId: string, actions: Record<string, ActionConfig>) => void;
  setActivePropertyTab: (tab: PropertyTab) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: SectionCategory | 'All') => void;
  togglePropertyPanel: () => void;
  togglePropertyPanelPosition: () => void;
  togglePropsExpand: () => void;
  resetPage: () => void;
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);

  const selectedSection = useMemo(() => {
    if (!state.selectedSectionId) return null;
    return state.page.sections.find((sec) => sec.id === state.selectedSectionId) || null;
  }, [state.page.sections, state.selectedSectionId]);

  const selectedSectionItem = useMemo(() => {
    if (!selectedSection) return null;
    return getSection(selectedSection.componentId) || null;
  }, [selectedSection]);

  const selectedSectionSchema = useMemo(() => {
    if (!selectedSection) return null;
    return getSectionSchema(selectedSection.componentId) || null;
  }, [selectedSection]);

  const addSection = (componentId: string, targetIndex?: number) => {
    if (typeof targetIndex === 'number') {
      dispatch({ type: 'ADD_SECTION', componentId, targetIndex });
    } else {
      dispatch({ type: 'ADD_SECTION', componentId });
    }
  };

  const removeSection = (sectionId: string) => {
    dispatch({ type: 'REMOVE_SECTION', sectionId });
  };

  const duplicateSection = (sectionId: string) => {
    dispatch({ type: 'DUPLICATE_SECTION', sectionId });
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    dispatch({ type: 'MOVE_SECTION', sectionId, direction });
  };

  const reorderSections = (sourceIndex: number, destinationIndex: number) => {
    dispatch({ type: 'REORDER_SECTIONS', sourceIndex, destinationIndex });
  };

  const selectSection = (sectionId: string | null, tab?: PropertyTab) => {
    if (tab) {
      dispatch({ type: 'SELECT_SECTION', sectionId, tab });
    } else {
      dispatch({ type: 'SELECT_SECTION', sectionId });
    }
  };

  const hoverSection = (sectionId: string | null) => {
    dispatch({ type: 'HOVER_SECTION', sectionId });
  };

  const setActiveDropIndex = (index: number | null) => {
    dispatch({ type: 'SET_ACTIVE_DROP_INDEX', index });
  };

  const updateSectionProps = (sectionId: string, props: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_SECTION_PROPS', sectionId, props });
  };

  const updateSectionStyle = (sectionId: string, style: ResponsiveSectionStyle) => {
    dispatch({ type: 'UPDATE_SECTION_STYLE', sectionId, style });
  };

  const updateSectionActions = (sectionId: string, actions: Record<string, ActionConfig>) => {
    dispatch({ type: 'UPDATE_SECTION_ACTIONS', sectionId, actions });
  };

  const setActivePropertyTab = (tab: PropertyTab) => {
    dispatch({ type: 'SET_ACTIVE_PROPERTY_TAB', tab });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', query });
  };

  const setSelectedCategory = (category: SectionCategory | 'All') => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', category });
  };

  const togglePropertyPanel = () => {
    dispatch({ type: 'TOGGLE_PROPERTY_PANEL' });
  };

  const togglePropertyPanelPosition = () => {
    dispatch({ type: 'TOGGLE_PROPERTY_PANEL_POSITION' });
  };

  const togglePropsExpand = () => {
    dispatch({ type: 'TOGGLE_PROPS_EXPAND' });
  };

  const resetPage = () => {
    dispatch({ type: 'RESET_PAGE' });
  };

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      dispatch,
      selectedSection,
      selectedSectionItem,
      selectedSectionSchema,
      addSection,
      removeSection,
      duplicateSection,
      moveSection,
      reorderSections,
      selectSection,
      hoverSection,
      setActiveDropIndex,
      updateSectionProps,
      updateSectionStyle,
      updateSectionActions,
      setActivePropertyTab,
      setSearchQuery,
      setSelectedCategory,
      togglePropertyPanel,
      togglePropertyPanelPosition,
      togglePropsExpand,
      resetPage,
    }),
    [state, selectedSection, selectedSectionItem, selectedSectionSchema],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = (): EditorContextValue => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
