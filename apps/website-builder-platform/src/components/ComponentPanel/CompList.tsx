import React, { useMemo } from 'react';
import { SearchX } from 'lucide-react';

import { getAllSections } from '@repo/component-library';

import { EmptyState, SegmentedControl } from '../../design-system';
import { useEditor } from '../../state/editorContext';
import { DraggableComponentCard } from './DraggableComponentCard';

import type { SectionCategory, SectionRegistryItem } from '@repo/component-library';

const ALL_CATEGORIES: (SectionCategory | 'All')[] = [
  'All',
  'Navigation',
  'Hero',
  'Content',
  'Media',
  'Business',
  'Conversion',
  'Utility',
];

export const CompList: React.FC = () => {
  const { state, setSelectedCategory } = useEditor();
  const allSections = useMemo(() => getAllSections(), []);

  // Filter sections by search query and category
  const filteredSections = useMemo(() => {
    return allSections.filter((item) => {
      const matchesCategory =
        state.selectedCategory === 'All' || item.category === state.selectedCategory;

      if (!matchesCategory) return false;

      if (!state.searchQuery.trim()) return true;

      const query = state.searchQuery.toLowerCase();
      const matchesName = item.displayName.toLowerCase().includes(query);
      const matchesDesc = item.description.toLowerCase().includes(query);
      const matchesTag = item.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesName || matchesDesc || matchesTag;
    });
  }, [allSections, state.selectedCategory, state.searchQuery]);

  // Group filtered sections by category
  const groupedSections = useMemo(() => {
    const groups: Partial<Record<SectionCategory, SectionRegistryItem[]>> = {};

    filteredSections.forEach((sec) => {
      if (!groups[sec.category]) {
        groups[sec.category] = [];
      }
      groups[sec.category]!.push(sec);
    });

    return groups;
  }, [filteredSections]);

  const categoryItems = useMemo(() => {
    return ALL_CATEGORIES.map((cat) => {
      const count =
        cat === 'All' ? allSections.length : allSections.filter((s) => s.category === cat).length;
      return {
        value: cat,
        label: cat,
        count,
      };
    }).filter((cat) => cat.value === 'All' || (cat.count && cat.count > 0));
  }, [allSections]);

  return (
    <>
      <SegmentedControl
        value={state.selectedCategory}
        onChange={(cat) => setSelectedCategory(cat as SectionCategory | 'All')}
        items={categoryItems}
        className="ws-category-filter-bar"
      />

      <div className="ws-component-list-scroll">
        {filteredSections.length === 0 ? (
          <EmptyState
            icon={<SearchX size={28} />}
            title="No sections found"
            description="Try searching for a different keyword or category."
            className="ws-empty-search"
          />
        ) : (
          Object.entries(groupedSections).map(([category, items]) => (
            <div key={category} className="ws-category-group">
              <div className="ws-category-group-header">
                <span>{category}</span>
                <span>{items?.length}</span>
              </div>

              <div className="ws-dnd-drag-card-group">
                {items?.map((item) => (
                  <DraggableComponentCard key={item.componentId} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
