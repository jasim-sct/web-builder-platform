import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

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
    // Generate default item from itemSchema
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
      <div className="ws-array-header">
        <span className="ws-array-title">
          {schema.label || propKey} ({items.length})
        </span>

        <button
          type="button"
          className="ws-btn-base ws-btn-secondary"
          style={{ padding: '4px 8px', fontSize: '11px' }}
          onClick={handleAddItem}
        >
          <Plus size={12} />
          Add Item
        </button>
      </div>

      {schema.description && <p className="ws-form-desc">{schema.description}</p>}

      <div className="ws-array-items-list">
        {items.map((item, index) => {
          const isObject = typeof item === 'object' && item !== null;

          return (
            <div key={index} className="ws-array-item-card">
              <div className="ws-array-item-header">
                <span className="ws-item-index-badge">Item #{index + 1}</span>

                <button
                  type="button"
                  className="ws-item-remove-btn"
                  onClick={() => handleRemoveItem(index)}
                  title="Remove Item"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {isObject ? (
                Object.entries(itemSchema).length > 0 ? (
                  Object.entries(itemSchema).map(([fieldKey, subSchema]) => (
                    <div key={fieldKey} className="ws-form-group">
                      <div className="ws-label-row">
                        <span className="ws-form-label" style={{ fontSize: '11px' }}>
                          {subSchema.label || fieldKey}
                        </span>
                      </div>

                      {subSchema.type === 'textarea' ? (
                        <textarea
                          className="ws-textarea-input"
                          style={{ minHeight: '50px', fontSize: '12px' }}
                          value={String((item as Record<string, unknown>)[fieldKey] ?? '')}
                          onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          className="ws-text-input"
                          style={{ fontSize: '12px', padding: '6px 8px' }}
                          value={String((item as Record<string, unknown>)[fieldKey] ?? '')}
                          onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  Object.entries(item as Record<string, unknown>).map(([fieldKey, val]) => (
                    <div key={fieldKey} className="ws-form-group">
                      <div className="ws-label-row">
                        <span className="ws-form-label" style={{ fontSize: '11px' }}>
                          {fieldKey}
                        </span>
                      </div>
                      <input
                        type="text"
                        className="ws-text-input"
                        style={{ fontSize: '12px', padding: '6px 8px' }}
                        value={String(val ?? '')}
                        onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                      />
                    </div>
                  ))
                )
              ) : (
                <input
                  type="text"
                  className="ws-text-input"
                  value={String(item ?? '')}
                  onChange={(e) => handleFieldChange(index, '', e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
