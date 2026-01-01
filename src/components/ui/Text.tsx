/**
 * Text Component - 2025 Redesign
 * Typography component with consistent scale and theme support
 */

import React, { HTMLAttributes, ElementType } from 'react';
import './Text.css';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'body-lg'
  | 'body-sm'
  | 'caption'
  | 'label';

export type TextColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'error' | 'success';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  color?: TextColor;
  as?: ElementType;
  children: React.ReactNode;
}

const variantToElement: Record<TextVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  'body-lg': 'p',
  'body-sm': 'p',
  caption: 'span',
  label: 'label',
};

export const Text = ({
  variant = 'body',
  color = 'primary',
  as,
  className = '',
  children,
  ...props
}: TextProps) => {
  const Component = as || variantToElement[variant];
  const classes = [
    'text',
    `text-${variant}`,
    `text-color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Text;

