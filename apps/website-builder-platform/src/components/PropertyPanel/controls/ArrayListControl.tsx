import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormField,
  IconButton,
  Textarea,
  TextInput,
} from '../../../design-system';

import type { PropertySchema } from '@repo/component-library';

interface ArrayListControlProps {
  propKey: string;
  schema: PropertySchema;
  value: unknown;
  onChange: (key: string, value: unknown[]) => void;
}

export const ArrayListControl: React.FC<ArrayListControlProps> = ({
  propKey,
  schema,
  value,
  onChange,
}) => {
  const items = Array.isArray(value) ? value : [];
  const itemSchema = schema.itemSchema || {};

  const handleAddItem = () => {
    const defaultItem: Record<string, unknown> = {};
    Object.entries(itemSchema).forEach(([k, s]) => {
      defaultItem[k] = s.defaultValue ?? '';
    });

    onChange(propKey, [...items, defaultItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(propKey, updated);
  };

  const handleFieldChange = (itemIndex: number, fieldKey: string, fieldValue: unknown) => {
    const updated = items.map((item, i) => {
      if (i !== itemIndex) return item;
      if (typeof item === 'object' && item !== null) {
        return {
          ...item,
          [fieldKey]: fieldValue,
        };
      }
      return fieldValue;
    });
    onChange(propKey, updated);
  };

  return (
    <div className="ws-array-list-manager">
      <div
        className="ws-array-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span
          className="ws-array-title"
          style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}
        >
          {schema.label || propKey} ({items.length})
        </span>

        <Button variant="secondary" size="xs" icon={<Plus size={12} />} onClick={handleAddItem}>
          Add Item
        </Button>
      </div>

      {schema.description && <p className="ds-form-desc ws-form-desc">{schema.description}</p>}

      <div
        className="ws-array-items-list"
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {items.map((item, index) => {
          const isObject = typeof item === 'object' && item !== null;

          return (
            <Card key={index} className="ws-array-item-card">
              <CardHeader style={{ padding: '8px 12px' }}>
                <Badge variant="default" className="ws-item-index-badge">
                  Item #{index + 1}
                </Badge>

                <IconButton
                  icon={<Trash2 size={13} />}
                  title="Remove Item"
                  variant="ghost"
                  size="xs"
                  onClick={() => handleRemoveItem(index)}
                  className="ws-item-remove-btn"
                />
              </CardHeader>

              <CardBody
                style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                {isObject ? (
                  Object.entries(itemSchema).length > 0 ? (
                    Object.entries(itemSchema).map(([fieldKey, subSchema]) => (
                      <FormField key={fieldKey} label={subSchema.label || fieldKey}>
                        {subSchema.type === 'textarea' ? (
                          <Textarea
                            value={String((item as Record<string, unknown>)[fieldKey] ?? '')}
                            onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                          />
                        ) : (
                          <TextInput
                            inputSize="sm"
                            value={String((item as Record<string, unknown>)[fieldKey] ?? '')}
                            onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                          />
                        )}
                      </FormField>
                    ))
                  ) : (
                    Object.entries(item as Record<string, unknown>).map(([fieldKey, val]) => (
                      <FormField key={fieldKey} label={fieldKey}>
                        <TextInput
                          inputSize="sm"
                          value={String(val ?? '')}
                          onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                        />
                      </FormField>
                    ))
                  )
                ) : (
                  <TextInput
                    inputSize="sm"
                    value={String(item ?? '')}
                    onChange={(e) => handleFieldChange(index, '', e.target.value)}
                  />
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
