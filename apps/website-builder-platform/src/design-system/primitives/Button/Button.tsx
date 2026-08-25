import React from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'subtle';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  isActive?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      icon,
      iconRight,
      fullWidth = false,
      isActive = false,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          'ds-btn',
          `ds-btn--${variant}`,
          `ds-btn--${size}`,
          fullWidth && 'ds-btn--full-width',
          isActive && 'is-active',
          className,
        )}
        {...props}
      >
        {icon && <span className="ds-btn-icon">{icon}</span>}
        {children && <span>{children}</span>}
        {iconRight && <span className="ds-btn-icon-right">{iconRight}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      icon,
      title,
      isActive = false,
      className,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        title={title}
        aria-label={title}
        className={clsx(
          'ds-btn',
          'ds-btn--icon-only',
          `ds-btn--${variant}`,
          `ds-btn--${size}`,
          isActive && 'is-active',
          className,
        )}
        {...props}
      >
        {icon}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ className, children, ...props }) => {
  return (
    <div className={clsx('ds-button-group', className)} {...props}>
      {children}
    </div>
  );
};
