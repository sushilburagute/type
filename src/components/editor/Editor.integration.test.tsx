import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Editor } from '@/components/editor/Editor'
import { Workspace } from '@/components/workspace/Workspace'
import { ToastHost } from '@/components/toast/ToastHost'
import { INPUT_DEBOUNCE_MS } from '@/constants/limits'
import { useEditorsStore } from '@/store/editors.store'
import { renderApp, resetStores } from '@/test/render'

describe('editor interactions', () => {
  beforeEach(() => resetStores())

  it('keeps typing in the textarea until the debounce commits it and refreshes stats', () => {
    vi.useFakeTimers()
    const id = useEditorsStore.getState().order[0]!
    renderApp(<Editor id={id} index={0} />)

    fireEvent.input(screen.getByRole('textbox', { name: 'untitled' }), {
      target: { value: 'hello world\nagain' },
    })

    expect(useEditorsStore.getState().editors[id]?.content).toBe('')
    expect(screen.getByText('0 chars')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(INPUT_DEBOUNCE_MS))

    expect(useEditorsStore.getState().editors[id]?.content).toBe('hello world\nagain')
    expect(screen.getByText('17 chars')).toBeInTheDocument()
    expect(screen.getByText('3 words')).toBeInTheDocument()
    expect(screen.getByText('2 lines')).toBeInTheDocument()
  })

  it('adds, focuses, and closes editor columns', () => {
    renderApp(<Workspace />)

    fireEvent.click(screen.getByRole('button', { name: 'new editor' }))

    expect(screen.getAllByRole('region', { name: /editor \d:/ })).toHaveLength(2)
    expect(screen.getAllByRole('textbox', { name: 'untitled' })[1]).toHaveFocus()

    fireEvent.click(screen.getAllByRole('button', { name: 'close editor' })[1]!)

    expect(screen.getAllByRole('region', { name: /editor \d:/ })).toHaveLength(1)
    expect(useEditorsStore.getState().order).toHaveLength(1)
  })

  it('applies a format, copies the result, and announces success', async () => {
    const id = useEditorsStore.getState().order[0]!
    useEditorsStore.getState().replaceContent(id, 'make me loud')
    const originalHidePopover = HTMLElement.prototype.hidePopover
    HTMLElement.prototype.hidePopover = vi.fn()

    renderApp(
      <>
        <Editor id={id} index={0} />
        <ToastHost />
      </>,
    )

    fireEvent.click(screen.getByText('uppercase').closest('button')!)
    expect(screen.getByRole('textbox', { name: 'untitled' })).toHaveValue('MAKE ME LOUD')

    fireEvent.click(screen.getByRole('button', { name: 'copy' }))

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('MAKE ME LOUD'))
    expect(await screen.findByRole('status')).toHaveTextContent('copied')

    HTMLElement.prototype.hidePopover = originalHidePopover
  })
})
