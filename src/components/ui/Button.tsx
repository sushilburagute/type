import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'solid'
  size?: 'sm' | 'md'
}

/** text button. lowercase by convention — pass lowercase children. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'ghost', size = 'md', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors duration-150',
        size === 'sm' ? 'h-7 px-2 text-xs' : 'h-9 px-3 text-sm',
        variant === 'ghost' && 'text-muted hover:bg-surface-2 hover:text-fg',
        variant === 'solid' && 'bg-fg text-bg hover:opacity-85',
        className,
      )}
      {...rest}
    />
  )
})
