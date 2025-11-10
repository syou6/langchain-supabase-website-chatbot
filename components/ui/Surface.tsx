import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {}

const Surface = ({ className, ...props }: SurfaceProps) => (
  <div
    className={clsx(
      'rounded-5xl border border-premium-stroke/40 bg-premium-surface/70 p-6 shadow-premium backdrop-blur-2xl sm:p-8',
      className,
    )}
    {...props}
  />
);

export default Surface;
