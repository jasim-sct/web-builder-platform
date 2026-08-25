import type {
  ActionConfig,
  ResponsiveSectionStyle,
  SectionCategory,
  SectionInstance,
} from '@repo/component-library';

export interface PageData {
  id: string;
  name: string;
  slug?: string;
  sections: SectionInstance[];
}

export type PropertyTab = 'style' | 'props' | 'actions';

export interface EditorState {
  page: PageData;
  selectedSectionId: string | null;
  hoveredSectionId: string | null;
  activeDropIndex: number | null;
  activePropertyTab: PropertyTab;
  searchQuery: string;
  selectedCategory: SectionCategory | 'All';
  isPropertyPanelOpen: boolean;
  propertyPanelPosition: 'right' | 'left';
  isPropsExpanded: boolean;
}

export type EditorAction =
  | { type: 'ADD_SECTION'; componentId: string; targetIndex?: number }
  | { type: 'REMOVE_SECTION'; sectionId: string }
  | { type: 'DUPLICATE_SECTION'; sectionId: string }
  | { type: 'MOVE_SECTION'; sectionId: string; direction: 'up' | 'down' }
  | { type: 'REORDER_SECTIONS'; sourceIndex: number; destinationIndex: number }
  | { type: 'SELECT_SECTION'; sectionId: string | null; tab?: PropertyTab }
  | { type: 'HOVER_SECTION'; sectionId: string | null }
  | { type: 'SET_ACTIVE_DROP_INDEX'; index: number | null }
  | { type: 'UPDATE_SECTION_PROPS'; sectionId: string; props: Record<string, unknown> }
  | { type: 'UPDATE_SECTION_STYLE'; sectionId: string; style: ResponsiveSectionStyle }
  | { type: 'UPDATE_SECTION_ACTIONS'; sectionId: string; actions: Record<string, ActionConfig> }
  | { type: 'SET_ACTIVE_PROPERTY_TAB'; tab: PropertyTab }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_SELECTED_CATEGORY'; category: SectionCategory | 'All' }
  | { type: 'TOGGLE_PROPERTY_PANEL' }
  | { type: 'TOGGLE_PROPERTY_PANEL_POSITION' }
  | { type: 'TOGGLE_PROPS_EXPAND' }
  | { type: 'RESET_PAGE' };

export interface DragComponentPayload {
  componentId: string;
  displayName: string;
  category: SectionCategory;
}
