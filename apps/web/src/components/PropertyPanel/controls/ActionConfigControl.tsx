import type { ActionConfig, ActionPropertySchema, ActionType } from '@repo/component-library';

interface ActionConfigControlProps {
  actionName: string;
  schema?: ActionPropertySchema | { label?: string; description?: string | undefined };
  actionConfig?: ActionConfig | undefined;
  onChange: (name: string, config: ActionConfig) => void;
}

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
    <div className="ws-form-group">
      <div className="ws-label-row">
        <label className="ws-form-label">{schema?.label || actionName}</label>
      </div>

      {schema?.description && <p className="ws-form-desc">{schema.description}</p>}

      {/* Action Type */}
      <div className="ws-form-group" style={{ marginTop: '4px' }}>
        <span className="ws-form-label" style={{ fontSize: '11px' }}>
          Action Type
        </span>
        <select
          className="ws-select-input"
          value={currentType}
          onChange={(e) => handleTypeChange(e.target.value as ActionType)}
        >
          <option value="navigate">Navigate Internal Route</option>
          <option value="externalUrl">Open External URL</option>
          <option value="openPopup">Open Modal / Popup</option>
          <option value="scrollToSection">Scroll to Section</option>
          <option value="submitApi">Submit API Payload</option>
        </select>
      </div>

      {/* Action Target / URL Input based on Action Type */}
      {currentType === 'navigate' && (
        <div className="ws-form-group" style={{ marginTop: '4px' }}>
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Target Route (e.g. /pricing, /about)
          </span>
          <input
            type="text"
            className="ws-text-input"
            value={actionConfig.target || ''}
            placeholder="/contact"
            onChange={(e) => handleFieldChange('target', e.target.value)}
          />
        </div>
      )}

      {currentType === 'externalUrl' && (
        <div className="ws-form-group" style={{ marginTop: '4px' }}>
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            External URL
          </span>
          <input
            type="text"
            className="ws-text-input"
            value={actionConfig.url || ''}
            placeholder="https://example.com"
            onChange={(e) => handleFieldChange('url', e.target.value)}
          />
        </div>
      )}

      {currentType === 'scrollToSection' && (
        <div className="ws-form-group" style={{ marginTop: '4px' }}>
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Target Section ID
          </span>
          <input
            type="text"
            className="ws-text-input"
            value={actionConfig.sectionId || ''}
            placeholder="pricing-section"
            onChange={(e) => handleFieldChange('sectionId', e.target.value)}
          />
        </div>
      )}

      {/* Open in New Tab Toggle for Links */}
      {(currentType === 'externalUrl' || currentType === 'navigate') && (
        <div className="ws-toggle-row" style={{ marginTop: '4px' }}>
          <span className="ws-toggle-label" style={{ fontSize: '12px' }}>
            Open in New Tab
          </span>
          <label className="ws-dnd-property-toggle">
            <input
              type="checkbox"
              checked={actionConfig.openInNewTab || false}
              onChange={(e) => handleFieldChange('openInNewTab', e.target.checked)}
            />
            <span className="ws-toggle-slider" />
          </label>
        </div>
      )}
    </div>
  );
};
