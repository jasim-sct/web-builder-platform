import React from 'react';
import clsx from 'clsx';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ level = 2, className, children, ...props }) => {
  const Tag = `h${level}` as const;
  return (
    <Tag className={clsx('ds-heading', `ds-heading--h${level}`, className)} {...props}>
      {children}
    </Tag>
  );
};

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement | HTMLSpanElement> {
  as?: 'p' | 'span' | 'div';
  variant?: 'primary' | 'secondary' | 'muted' | 'subtle' | 'brand';
  size?: '2xs' | 'xs' | 'sm' | 'base' | 'md' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={clsx(
        'ds-text',
        `ds-text--${variant}`,
        `ds-text--size-${size}`,
        `ds-text--weight-${weight}`,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ required, className, children, ...props }) => {
  return (
    <label className={clsx('ds-form-label', 'ws-form-label', className)} {...props}>
      {children}
      {required && <span className="ds-form-required ws-form-required">*</span>}
    </label>
  );
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  return (
    <span className={clsx('ds-badge', `ds-badge--${variant}`, className)} {...props}>
      {children}
    </span>
  );
};

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Kbd: React.FC<KbdProps> = ({ className, children, ...props }) => {
  return (
    <kbd className={clsx('ds-kbd', className)} {...props}>
      {children}
    </kbd>
  );
};
