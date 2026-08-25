import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isInteractive?: boolean;
  isSelected?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  isInteractive = false,
  isSelected = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'ds-card',
        isInteractive && 'ds-card--interactive',
        isSelected && 'ds-card--selected',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={clsx('ds-card-header', className)} {...props}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={clsx('ds-card-body', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={clsx('ds-card-footer', className)} {...props}>
      {children}
    </div>
  );
};
