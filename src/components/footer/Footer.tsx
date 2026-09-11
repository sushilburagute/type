import { useUiStore } from '@/store/ui.store'
import { GithubLogoIcon, WarningIcon } from '@/components/ui/icons'

export const PORTFOLIO_URL = 'https://sush.dev'
export const REPO_URL = 'https://github.com/sushilburagute/type'

export function Footer() {
  const warning = useUiStore((s) => s.storageWarning)
  return (
    <footer className="grid h-9 shrink-0 grid-cols-[1fr_auto] items-center border-t border-line px-4 text-[11px] text-muted sm:grid-cols-[1fr_auto_1fr]">
      <span>
        made by{' '}
        <a
          href={PORTFOLIO_URL}
          rel="noopener"
          target="_blank"
          className="font-bold text-fg hover:text-accent"
        >
          sush
        </a>
      </span>
      {warning && (
        <span role="alert" className="hidden items-center gap-1 text-accent sm:inline-flex">
          <WarningIcon size={12} weight="bold" aria-hidden />
          {warning}
        </span>
      )}
      {!warning && <span className="hidden sm:inline">text stays in your browser. nothing is uploaded.</span>}
      <a
        href={REPO_URL}
        rel="noopener"
        target="_blank"
        className="inline-flex items-center gap-1 justify-self-end transition-colors hover:text-fg"
      >
        <GithubLogoIcon size={13} weight="bold" aria-hidden />
        source
      </a>
    </footer>
  )
}
