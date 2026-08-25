export interface DropPayload {
  type: 'new' | 'reorder';
  componentId?: string;
  sourceIndex?: number;
  sectionId?: string;
}

export interface DropExecutionActions {
  addSection: (componentId: string, targetIndex?: number) => void;
  reorderSections: (sourceIndex: number, destinationIndex: number) => void;
  setActiveDropIndex: (index: number | null) => void;
}

/**
 * Extracts payload data from a drag event's dataTransfer.
 */
export function extractDropData(dataTransfer: DataTransfer | null): DropPayload | null {
  if (!dataTransfer) return null;

  // Case 1: Reordering an existing section
  const reorderSourceIndex = dataTransfer.getData('section-source-index');
  if (reorderSourceIndex !== '') {
    const sourceIdx = parseInt(reorderSourceIndex, 10);
    const sectionId = dataTransfer.getData('section-id');
    if (!isNaN(sourceIdx)) {
      const payload: DropPayload = {
        type: 'reorder',
        sourceIndex: sourceIdx,
      };
      if (sectionId) {
        payload.sectionId = sectionId;
      }
      return payload;
    }
  }

  // Case 2: Dropping a new section with JSON payload
  const rawData = dataTransfer.getData('application/json');
  if (rawData) {
    try {
      const payload = JSON.parse(rawData);
      if (payload?.componentId) {
        return {
          type: 'new',
          componentId: payload.componentId,
        };
      }
    } catch {
      // Fall through to plain text check
    }
  }

  // Case 3: Dropping with plain text componentId
  const plainComponentId = dataTransfer.getData('text/plain');
  if (plainComponentId) {
    return {
      type: 'new',
      componentId: plainComponentId,
    };
  }

  return null;
}

/**
 * Calculates nearest insertion position relative to a single hovered section wrapper.
 * Upper half -> before (sectionIndex)
 * Lower half -> after (sectionIndex + 1)
 */
export function calculateSectionInsertionIndex(
  clientY: number,
  sectionElement: HTMLElement,
  sectionIndex: number,
): number {
  const rect = sectionElement.getBoundingClientRect();
  const midY = rect.top + rect.height / 2;
  const safeClientY = typeof clientY === 'number' && !isNaN(clientY) ? clientY : rect.top;
  return safeClientY < midY ? sectionIndex : sectionIndex + 1;
}

/**
 * Calculates nearest insertion index anywhere across the canvas.
 * Seamlessly resolves the closest insertion boundary (0 to totalSections)
 * based on the pointer's vertical distance to section midpoints.
 */
export function calculateCanvasInsertionIndex(
  clientY: number,
  containerElement: HTMLElement,
): number {
  const sectionWrappers = Array.from(
    containerElement.querySelectorAll<HTMLElement>('.ws-dnd-section-wrapper'),
  );

  if (sectionWrappers.length === 0) {
    return 0;
  }

  const safeClientY = typeof clientY === 'number' && !isNaN(clientY) ? clientY : 0;

  const midpoints = sectionWrappers.map((wrapper) => {
    const rect = wrapper.getBoundingClientRect();
    return rect.top + rect.height / 2;
  });

  // If above the first section midpoint
  if (safeClientY < midpoints[0]!) {
    return 0;
  }

  // Check between each adjacent pair of midpoints
  for (let i = 0; i < midpoints.length - 1; i++) {
    if (safeClientY >= midpoints[i]! && safeClientY < midpoints[i + 1]!) {
      return i + 1;
    }
  }

  // If at or below the last section midpoint
  return sectionWrappers.length;
}

/**
 * Executes a drop action at the resolved targetIndex.
 */
export function executeDrop(
  payload: DropPayload | null,
  targetIndex: number,
  actions: DropExecutionActions,
): void {
  actions.setActiveDropIndex(null);

  if (!payload) return;

  if (payload.type === 'reorder' && typeof payload.sourceIndex === 'number') {
    const sourceIdx = payload.sourceIndex;
    // Calculate new position after removing source index
    const destIdx = sourceIdx < targetIndex ? targetIndex - 1 : targetIndex;
    if (sourceIdx !== destIdx) {
      actions.reorderSections(sourceIdx, destIdx);
    }
    return;
  }

  if (payload.type === 'new' && payload.componentId) {
    actions.addSection(payload.componentId, targetIndex);
  }
}
