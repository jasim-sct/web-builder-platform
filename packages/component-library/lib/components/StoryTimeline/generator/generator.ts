
import { STORYTIMELINE_COMPONENT_ID } from '../constants';
import { defaultStoryTimelineActions, defaultStoryTimelineProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { StoryTimelineProps } from '../types';

export const generateStoryTimelineInstance = (
  overrides?: PartialSectionInstance<StoryTimelineProps>,
): SectionInstance<StoryTimelineProps> => ({
  id: overrides?.id || `storytimeline-${Date.now()}`,
  componentId: STORYTIMELINE_COMPONENT_ID,
  props: { ...defaultStoryTimelineProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultStoryTimelineActions, ...overrides?.actions },
});
