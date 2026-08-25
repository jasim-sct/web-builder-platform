
import { GALLERY_COMPONENT_ID } from '../constants';
import { defaultGalleryActions, defaultGalleryProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { GalleryProps } from '../types';

export const generateGalleryInstance = (
  overrides?: PartialSectionInstance<GalleryProps>,
): SectionInstance<GalleryProps> => ({
  id: overrides?.id || `gallery-${Date.now()}`,
  componentId: GALLERY_COMPONENT_ID,
  props: { ...defaultGalleryProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultGalleryActions, ...overrides?.actions },
});
