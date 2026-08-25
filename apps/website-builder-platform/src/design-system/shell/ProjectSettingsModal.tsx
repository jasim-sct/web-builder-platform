import React, { useState } from 'react';
import { Settings } from 'lucide-react';

import { Button } from '../primitives/Button';
import { FormField } from '../primitives/FormField';
import { Textarea, TextInput } from '../primitives/Input';
import { Modal } from '../primitives/Modal';

export interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageName: string;
  onSave: (newName: string) => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  pageName,
  onSave,
}) => {
  const [name, setName] = useState(pageName);
  const [slug, setSlug] = useState('home');
  const [description, setDescription] = useState(
    'Production landing page built with Website Builder Platform.',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={16} color="#3b82f6" />
          <span>Page Settings</span>
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <FormField
          label="Page Title"
          required
          description="Human-readable title displayed across the studio"
        >
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
        </FormField>

        <FormField label="URL Slug" description="Target path for routing and page deployment">
          <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} />
        </FormField>

        <FormField label="Meta Description" description="SEO metadata for the generated website">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
      </form>
    </Modal>
  );
};
