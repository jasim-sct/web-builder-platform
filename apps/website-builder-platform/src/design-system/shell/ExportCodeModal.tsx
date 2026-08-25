import React, { useState } from 'react';
import { Check, Code2, Copy } from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { Button } from '../primitives/Button';
import { Modal } from '../primitives/Modal';
import { Tabs } from '../primitives/Tabs';

export interface ExportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageData: unknown;
}

export const ExportCodeModal: React.FC<ExportCodeModalProps> = ({ isOpen, onClose, pageData }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'json' | 'react'>('json');
  const [hasCopied, setHasCopied] = useState(false);

  const jsonContent = JSON.stringify(pageData, null, 2);
  const reactContent = `// Auto-generated Page from Website Builder Platform
import React from 'react';
import {
  HeaderSection,
  HeroSection,
  FeaturesSection,
  PricingSection,
  TestimonialsSection,
  FAQSection,
  FooterSection
} from '@repo/component-library';

export const Page = () => {
  return (
    <main className="website-page">
      {/* Composed Sections */}
    </main>
  );
};
`;

  const currentCode = activeTab === 'json' ? jsonContent : reactContent;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setHasCopied(true);
      addToast({
        title: 'Copied to Clipboard',
        message: `Page ${activeTab.toUpperCase()} has been copied to your clipboard.`,
        type: 'success',
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      addToast({
        title: 'Copy Failed',
        message: 'Could not access clipboard.',
        type: 'danger',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code2 size={18} color="#3b82f6" />
          <span>Export Schema & Code</span>
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            icon={hasCopied ? <Check size={14} /> : <Copy size={14} />}
            onClick={handleCopy}
          >
            {hasCopied ? 'Copied!' : 'Copy Code'}
          </Button>
        </>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <Tabs
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'json' | 'react')}
          tabs={[
            { id: 'json', label: 'JSON Schema' },
            { id: 'react', label: 'React Code' },
          ]}
        />
      </div>

      <pre
        style={{
          background: '#0c0e14',
          border: '1px solid #1e2536',
          borderRadius: '6px',
          padding: '14px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          color: '#94a3b8',
          maxHeight: '340px',
          overflow: 'auto',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        <code>{currentCode}</code>
      </pre>
    </Modal>
  );
};
