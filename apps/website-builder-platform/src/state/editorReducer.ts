import { getSection } from '@repo/component-library';

import type { SectionInstance } from '@repo/component-library';
import type { EditorAction, EditorState } from '../types/editor';

export const initialEditorState: EditorState = {
  page: {
    id: 'page-default-01',
    name: 'Home Landing Page',
    slug: '/',
    sections: [],
  },
  selectedSectionId: null,
  hoveredSectionId: null,
  activeDropIndex: null,
  activePropertyTab: 'props',
  searchQuery: '',
  selectedCategory: 'All',
  isComponentPanelOpen: true,
  isComponentPanelMinimized: false,
  componentPanelPosition: null,
  isPropertyPanelOpen: true,
  propertyPanelPosition: 'right',
  isPropsExpanded: false,
};

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'ADD_SECTION': {
      const sectionItem = getSection(action.componentId);
      if (!sectionItem) {
        console.warn(`Unknown section componentId: ${action.componentId}`);
        return state;
      }

      const instanceId = `${action.componentId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newInstance: SectionInstance = sectionItem.generator({
        id: instanceId,
      });

      const updatedSections = [...state.page.sections];
      const insertAt =
        typeof action.targetIndex === 'number' &&
        action.targetIndex >= 0 &&
        action.targetIndex <= updatedSections.length
          ? action.targetIndex
          : updatedSections.length;

      updatedSections.splice(insertAt, 0, newInstance);

      return {
        ...state,
        page: {
          ...state.page,
          sections: updatedSections,
        },
        selectedSectionId: instanceId,
        activeDropIndex: null,
        isPropertyPanelOpen: true,
      };
    }

    case 'REMOVE_SECTION': {
      const updatedSections = state.page.sections.filter((sec) => sec.id !== action.sectionId);
      const isSelected = state.selectedSectionId === action.sectionId;

      return {
        ...state,
        page: {
          ...state.page,
          sections: updatedSections,
        },
        selectedSectionId: isSelected ? null : state.selectedSectionId,
      };
    }

    case 'DUPLICATE_SECTION': {
      const targetIndex = state.page.sections.findIndex((sec) => sec.id === action.sectionId);
      if (targetIndex === -1) return state;

      const target = state.page.sections[targetIndex];
      if (!target) return state;

      const newId = `${target.componentId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const clonedInstance: SectionInstance = {
        id: newId,
        componentId: target.componentId,
        props: JSON.parse(JSON.stringify(target.props || {})),
        style: JSON.parse(JSON.stringify(target.style || {})),
        actions: JSON.parse(JSON.stringify(target.actions || {})),
      };

      const updatedSections = [...state.page.sections];
      updatedSections.splice(targetIndex + 1, 0, clonedInstance);

      return {
        ...state,
        page: {
          ...state.page,
          sections: updatedSections,
        },
        selectedSectionId: newId,
      };
    }

    case 'MOVE_SECTION': {
      const currentIndex = state.page.sections.findIndex((sec) => sec.id === action.sectionId);
      if (currentIndex === -1) return state;

      const newIndex = action.direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= state.page.sections.length) return state;

      const updatedSections = [...state.page.sections];
      const [movedItem] = updatedSections.splice(currentIndex, 1);
      if (movedItem) {
        updatedSections.splice(newIndex, 0, movedItem);
      }

      return {
        ...state,
        page: {
          ...state.page,
          sections: updatedSections,
        },
      };
    }

    case 'REORDER_SECTIONS': {
      const { sourceIndex, destinationIndex } = action;
      if (
        sourceIndex < 0 ||
        sourceIndex >= state.page.sections.length ||
        destinationIndex < 0 ||
        destinationIndex >= state.page.sections.length ||
        sourceIndex === destinationIndex
      ) {
        return state;
      }

      const updatedSections = [...state.page.sections];
      const [movedItem] = updatedSections.splice(sourceIndex, 1);
      if (movedItem) {
        updatedSections.splice(destinationIndex, 0, movedItem);
      }

      return {
        ...state,
        page: {
          ...state.page,
          sections: updatedSections,
        },
        activeDropIndex: null,
      };
    }

    case 'SELECT_SECTION': {
      return {
        ...state,
        selectedSectionId: action.sectionId,
        activePropertyTab: action.tab || state.activePropertyTab,
        isPropertyPanelOpen: action.sectionId !== null ? true : state.isPropertyPanelOpen,
      };
    }

    case 'HOVER_SECTION': {
      return {
        ...state,
        hoveredSectionId: action.sectionId,
      };
    }

    case 'SET_ACTIVE_DROP_INDEX': {
      return {
        ...state,
        activeDropIndex: action.index,
      };
    }

    case 'UPDATE_SECTION_PROPS': {
      const updatedSections = state.page.sections.map((sec) => {
        if (sec.id !== action.sectionId) return sec;
        return {
          ...sec,
          props: {
            ...sec.props,
            ...action.props,
          },
        };
      });

      return {
        ...state,
        page: {
          ...state.page,
          sections: updatedSections,
        },
      };
    }

    case 'UPDATE_SECTION_STYLE': {
      const updatedSections = state.page.sections.map((sec) => {
        if (sec.id !== action.sectionId) return sec;
        return {
          ...sec,
          style: {
            ...sec.style,
            ...action.style,
          },
        };
      });

      return {
        ...state,
        page: {
          ...state.page,
          sections: updatedSections,
        },
      };
    }

    case 'UPDATE_SECTION_ACTIONS': {
      const updatedSections = state.page.sections.map((sec) => {
        if (sec.id !== action.sectionId) return sec;
        return {
          ...sec,
          actions: {
            ...sec.actions,
            ...action.actions,
          },
        };
      });

      return {
        ...state,
        page: {
          ...state.page,
          sections: updatedSections,
        },
      };
    }

    case 'SET_ACTIVE_PROPERTY_TAB': {
      return {
        ...state,
        activePropertyTab: action.tab,
      };
    }

    case 'SET_SEARCH_QUERY': {
      return {
        ...state,
        searchQuery: action.query,
      };
    }

    case 'SET_SELECTED_CATEGORY': {
      return {
        ...state,
        selectedCategory: action.category,
      };
    }

    case 'TOGGLE_COMPONENT_PANEL': {
      return {
        ...state,
        isComponentPanelOpen: !state.isComponentPanelOpen,
      };
    }

    case 'SET_COMPONENT_PANEL_OPEN': {
      return {
        ...state,
        isComponentPanelOpen: action.isOpen,
      };
    }

    case 'TOGGLE_COMPONENT_PANEL_MINIMIZE': {
      return {
        ...state,
        isComponentPanelMinimized: !state.isComponentPanelMinimized,
      };
    }

    case 'SET_COMPONENT_PANEL_POSITION': {
      return {
        ...state,
        componentPanelPosition: action.position,
      };
    }

    case 'TOGGLE_PROPERTY_PANEL': {
      return {
        ...state,
        isPropertyPanelOpen: !state.isPropertyPanelOpen,
      };
    }

    case 'TOGGLE_PROPERTY_PANEL_POSITION': {
      return {
        ...state,
        propertyPanelPosition: state.propertyPanelPosition === 'right' ? 'left' : 'right',
      };
    }

    case 'TOGGLE_PROPS_EXPAND': {
      return {
        ...state,
        isPropsExpanded: !state.isPropsExpanded,
      };
    }

    case 'RESET_PAGE': {
      return {
        ...state,
        page: {
          ...state.page,
          sections: [],
        },
        selectedSectionId: null,
      };
    }

    default:
      return state;
  }
}
