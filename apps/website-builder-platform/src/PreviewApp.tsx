import React, { useEffect, useState } from 'react';

import { renderSectionInstance } from '@repo/component-library';

import type { SectionInstance } from '@repo/component-library';

export const PreviewApp: React.FC = () => {
  const [sections, setSections] = useState<SectionInstance[]>([]);

  useEffect(() => {
    // Initial load
    try {
      const storedState = localStorage.getItem('builder_preview_state');
      if (storedState) {
        setSections(JSON.parse(storedState));
      }
    } catch (err) {
      console.error('Failed to load preview state:', err);
    }

    // Listen for cross-tab updates (Hot Reload)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'builder_preview_state' && event.newValue) {
        try {
          setSections(JSON.parse(event.newValue));
        } catch (err) {
          console.error('Failed to parse hot reloaded preview state:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (sections.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Preview Mode</h2>
        <p>No sections to preview or failed to load preview state.</p>
      </div>
    );
  }

  return (
    <div className="ws-preview-container">
      {sections.map((instance) => {
        return (
          <React.Fragment key={instance.id}>
            {renderSectionInstance(instance, { isEditor: false })}
          </React.Fragment>
        );
      })}
    </div>
  );
};
