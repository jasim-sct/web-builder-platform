import React from 'react';
import clsx from 'clsx';

export interface TabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  activeTab: T;
  onChange: (tabId: T) => void;
  tabs: TabItem<T>[];
  className?: string;
}

export function Tabs<T extends string = string>({
  activeTab,
  onChange,
  tabs,
  className,
}: TabsProps<T>) {
  return (
    <div className={clsx('ds-tab-list', 'ws-property-tabs-nav', className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={clsx(
              'ds-tab-trigger',
              'ws-property-tab-btn',
              isActive && 'is-active active',
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span className="ds-tab-icon">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
