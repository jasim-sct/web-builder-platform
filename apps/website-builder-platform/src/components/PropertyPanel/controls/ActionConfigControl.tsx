import React from 'react';

import { FormField, Select, Switch, TextInput } from '../../../design-system';

import type { ActionConfig, ActionPropertySchema, ActionType } from '@repo/component-library';

interface ActionConfigControlProps {
  actionName: string;
  schema?: ActionPropertySchema | { label?: string; description?: string | undefined };
  actionConfig?: ActionConfig | undefined;
  onChange: (name: string, config: ActionConfig) => void;
}

const ACTION_TYPE_OPTIONS = [
  { value: 'navigate', label: 'Navigate Internal Route' },
  { value: 'externalUrl', label: 'Open External URL' },
  { value: 'openPopup', label: 'Open Modal / Popup' },
  { value: 'scrollToSection', label: 'Scroll to Section' },
  { value: 'submitApi', label: 'Submit API Payload' },
];

export const ActionConfigControl: React.FC<ActionConfigControlProps> = ({
  actionName,
  schema,
  actionConfig = { type: 'navigate', target: '' },
  onChange,
}) => {
  const currentType = actionConfig.type || 'navigate';

  const handleTypeChange = (type: ActionType) => {
    onChange(actionName, {
      ...actionConfig,
      type,
    });
  };

  const handleFieldChange = (field: keyof ActionConfig, value: unknown) => {
    onChange(actionName, {
      ...actionConfig,
      [field]: value,
    });
  };

  return (
    <div className="ds-action-config-control">
      <FormField label="Action Type" description={schema?.description}>
        <Select
          options={ACTION_TYPE_OPTIONS}
          value={currentType}
          onChange={(e) => handleTypeChange(e.target.value as ActionType)}
        />
      </FormField>

      {/* Action Target / URL Input based on Action Type */}
      {currentType === 'navigate' && (
        <FormField label="Target Route (e.g. /pricing, /about)">
          <TextInput
            value={actionConfig.target || ''}
            placeholder="/contact"
            onChange={(e) => handleFieldChange('target', e.target.value)}
          />
        </FormField>
      )}

      {currentType === 'externalUrl' && (
        <FormField label="External URL">
          <TextInput
            value={actionConfig.url || ''}
            placeholder="https://example.com"
            onChange={(e) => handleFieldChange('url', e.target.value)}
          />
        </FormField>
      )}

      {currentType === 'scrollToSection' && (
        <FormField label="Target Section ID">
          <TextInput
            value={actionConfig.sectionId || ''}
            placeholder="pricing-section"
            onChange={(e) => handleFieldChange('sectionId', e.target.value)}
          />
        </FormField>
      )}

      {/* Open in New Tab Toggle for Links */}
      {(currentType === 'externalUrl' || currentType === 'navigate') && (
        <div style={{ marginTop: 8 }}>
          <Switch
            checked={actionConfig.openInNewTab || false}
            onChange={(checked) => handleFieldChange('openInNewTab', checked)}
            label="Open in New Tab"
          />
        </div>
      )}
    </div>
  );
};
