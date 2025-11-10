import clsx from 'clsx';
import { HTMLAttributes } from 'react';

const baseClass = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]';

const variants = {
  primary: 'border border-premium-accent/50 text-premium-accent',
  neutral: 'border border-premium-stroke/60 text-premium-muted',
  solid: 'bg-premium-accent/15 text-premium-text',
};

export type BadgeVariant = keyof typeof variants;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = ({ variant = 'neutral', className, ...props }: BadgeProps) => (
  <span className={clsx(baseClass, variants[variant], className)} {...props} />
);

export default Badge;
