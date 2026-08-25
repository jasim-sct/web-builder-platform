import React from 'react';

import { useEditor } from '../../../state/editorContext';
import { ActionConfigControl } from '../controls/ActionConfigControl';

import type { ActionConfig, SectionInstance, SectionSchema } from '@repo/component-library';

interface ActionsTabProps {
  section: SectionInstance;
  schema?: SectionSchema | null | undefined;
}

export const ActionsTab: React.FC<ActionsTabProps> = ({ section, schema }) => {
  const { updateSectionActions } = useEditor();
  const actionsSchema = schema?.actions || {};
  const currentActions = section.actions || {};

  const handleActionChange = (actionName: string, config: ActionConfig) => {
    updateSectionActions(section.id, {
      ...currentActions,
      [actionName]: config,
    });
  };

  const schemaEntries = Object.entries(actionsSchema);

  if (schemaEntries.length === 0) {
    return (
      <div className="ws-property-empty" style={{ minHeight: '180px' }}>
        <p className="ws-empty-title">No Actions Configured</p>
        <p className="ws-empty-desc">
          This section does not define interactive button or link actions in its schema.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {schemaEntries.map(([actionName, actionSchema]) => (
        <ActionConfigControl
          key={actionName}
          actionName={actionName}
          schema={actionSchema}
          actionConfig={currentActions[actionName]}
          onChange={handleActionChange}
        />
      ))}
    </div>
  );
};
