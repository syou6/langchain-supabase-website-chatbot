import clsx from 'clsx';
import { HTMLAttributes } from 'react';

const baseClass = 'rounded-4xl border border-premium-stroke/40 bg-premium-surface/70 shadow-premium backdrop-blur-xl';

const variants = {
  default: baseClass,
  elevated: clsx(baseClass, 'shadow-glow border-premium-accent/40'),
  dashed: clsx(baseClass, 'border-dashed'),
  surface: 'rounded-4xl border border-premium-stroke/40 bg-premium-surface/80',
};

export type CardVariant = keyof typeof variants;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const Card = ({ variant = 'default', className, ...props }: CardProps) => {
  return <div className={clsx(variants[variant], className)} {...props} />;
};

export default Card;
