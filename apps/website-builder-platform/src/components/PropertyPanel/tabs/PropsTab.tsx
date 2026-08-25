import React from 'react';

import { FormField, TextInput } from '../../../design-system';
import { useEditor } from '../../../state/editorContext';
import { ArrayListControl } from '../controls/ArrayListControl';
import { ColorPickerControl } from '../controls/ColorPickerControl';
import { NumberInputControl } from '../controls/NumberInputControl';
import { SelectDropdownControl } from '../controls/SelectDropdownControl';
import { SwitchToggleControl } from '../controls/SwitchToggleControl';
import { TextInputControl } from '../controls/TextInputControl';

import type { SectionInstance, SectionSchema } from '@repo/component-library';

interface PropsTabProps {
  section: SectionInstance;
  schema?: SectionSchema | null | undefined;
}

export const PropsTab: React.FC<PropsTabProps> = ({ section, schema }) => {
  const { updateSectionProps } = useEditor();
  const propsSchema = schema?.props || {};
  const currentProps = section.props || {};

  const handlePropChange = (key: string, value: unknown) => {
    updateSectionProps(section.id, {
      [key]: value,
    });
  };

  const schemaEntries = Object.entries(propsSchema);

  if (schemaEntries.length === 0) {
    // If no schema entries, fallback to rendering existing props keys
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(currentProps).map(([key, val]) => (
          <FormField key={key} label={key}>
            <TextInput
              value={String(val ?? '')}
              onChange={(e) => handlePropChange(key, e.target.value)}
            />
          </FormField>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {schemaEntries.map(([propKey, propSchema]) => {
        const value = currentProps[propKey];

        switch (propSchema.type) {
          case 'array':
            return (
              <ArrayListControl
                key={propKey}
                propKey={propKey}
                schema={propSchema}
                value={value}
                onChange={handlePropChange}
              />
            );

          case 'boolean':
            return (
              <SwitchToggleControl
                key={propKey}
                propKey={propKey}
                schema={propSchema}
                value={value}
                onChange={handlePropChange}
              />
            );

          case 'number':
            return (
              <NumberInputControl
                key={propKey}
                propKey={propKey}
                schema={propSchema}
                value={value}
                onChange={handlePropChange}
              />
            );

          case 'select':
            return (
              <SelectDropdownControl
                key={propKey}
                propKey={propKey}
                schema={propSchema}
                value={value}
                onChange={handlePropChange}
              />
            );

          case 'color':
            return (
              <ColorPickerControl
                key={propKey}
                propKey={propKey}
                schema={propSchema}
                value={value}
                onChange={handlePropChange}
              />
            );

          case 'textarea':
            return (
              <TextInputControl
                key={propKey}
                propKey={propKey}
                schema={propSchema}
                value={value}
                onChange={handlePropChange}
                isTextarea={true}
              />
            );

          case 'text':
          case 'image':
          case 'icon':
          case 'link':
          default:
            return (
              <TextInputControl
                key={propKey}
                propKey={propKey}
                schema={propSchema}
                value={value}
                onChange={handlePropChange}
              />
            );
        }
      })}
    </div>
  );
};
