import React from 'react';
import clsx from 'clsx';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer';
  children: React.ReactNode;
}

export const Box: React.FC<BoxProps> = ({
  as: Component = 'div',
  className,
  children,
  ...props
}) => {
  return (
    <Component className={clsx('ds-box', className)} {...props}>
      {children}
    </Component>
  );
};

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  gap?: number | string;
  wrap?: boolean;
  children: React.ReactNode;
}

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  align = 'center',
  justify = 'flex-start',
  gap,
  wrap = false,
  style,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx('ds-flex', className)}
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number | string;
  children: React.ReactNode;
}

export const Stack: React.FC<StackProps> = ({ gap = 16, style, className, children, ...props }) => {
  return (
    <div
      className={clsx('ds-stack', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement | HTMLDivElement> {
  vertical?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ vertical = false, className, ...props }) => {
  if (vertical) {
    return (
      <div
        className={clsx('ws-header-divider', className)}
        style={{ width: 1, height: 20, background: '#272d3d' }}
        {...props}
      />
    );
  }
  return (
    <hr
      className={clsx('ds-divider', className)}
      style={{ border: 'none', borderTop: '1px solid #272d3d', margin: '8px 0' }}
      {...props}
    />
  );
};
