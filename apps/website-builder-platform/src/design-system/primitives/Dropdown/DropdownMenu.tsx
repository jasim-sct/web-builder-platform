import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export interface DropdownMenuItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  isDanger?: boolean;
  onClick: () => void;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: (DropdownMenuItem | 'divider')[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="ds-dropdown-wrapper" style={{ position: 'relative' }}>
      <div onClick={() => setIsOpen((prev) => !prev)} style={{ display: 'inline-flex' }}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={clsx(
            'ds-dropdown-menu',
            align === 'left' && 'ds-dropdown-menu--left',
            className,
          )}
        >
          {items.map((item, index) => {
            if (item === 'divider') {
              return <div key={`divider-${index}`} className="ds-dropdown-divider" />;
            }
            return (
              <button
                key={item.id}
                type="button"
                className={clsx('ds-dropdown-item', item.isDanger && 'is-danger')}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
              >
                {item.icon && <span className="ds-dropdown-item-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
