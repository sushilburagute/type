import { selectEditorCount, selectHasAnyContent, useEditorsStore } from '@/store/editors.store'
import { useUiStore } from '@/store/ui.store'
import { flushInput } from '@/hooks/useEditorContent'
import { track } from '@/utils/analytics'
import { IconButton } from '@/components/ui/IconButton'
import { EraserIcon, GitDiffIcon } from '@/components/ui/icons'
import { HeaderMenu } from '@/components/header-menu/HeaderMenu'

export function TopBar() {
  const count = useEditorsStore(selectEditorCount)
  const clearAllContent = useEditorsStore((s) => s.clearAllContent)
  const setCompareOpen = useUiStore((s) => s.setCompareOpen)

  const openCompare = () => {
    flushInput()
    setCompareOpen(true)
    track('compare_open')
  }

  const clearAll = () => {
    flushInput()
    const state = useEditorsStore.getState()
    if (!selectHasAnyContent(state)) return
    if (!window.confirm('clear all open editors? all text will be lost.')) return
    clearAllContent()
    useUiStore.getState().pushToast('all editors cleared')
    track('clear_all', { editors: count })
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-line pr-2 pl-4 sm:gap-2 sm:pl-5">
      <h1 className="mr-auto text-2xl font-bold tracking-tight text-accent select-none sm:text-[28px]">
        type
      </h1>
      <IconButton
        icon={GitDiffIcon}
        label={count < 2 ? 'compare (open a second editor first)' : 'compare editors'}
        onClick={openCompare}
        disabled={count < 2}
      />
      <IconButton icon={EraserIcon} label="clear all editors" onClick={clearAll} />
      <HeaderMenu />
    </header>
  )
}
