import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { type Icon } from '@/components/ui/icons'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: Icon
  /** accessible name; also used as the native tooltip */
  label: string
  size?: 'sm' | 'md'
  active?: boolean
}

/** square, quiet button with a single phosphor glyph. the label is announced, never shown. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Glyph, label, size = 'md', active = false, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-150',
        'hover:bg-surface-2 hover:text-fg',
        size === 'sm' ? 'size-7' : 'size-9',
        active && 'text-accent',
        className,
      )}
      {...rest}
    >
      <Glyph size={size === 'sm' ? 16 : 18} weight="bold" aria-hidden />
    </button>
  )
})
