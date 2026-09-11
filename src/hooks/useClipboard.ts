import { useCallback } from 'react'
import { copyText } from '@/utils/clipboard'
import { useToast } from '@/hooks/useToast'
import { track } from '@/utils/analytics'

export function useClipboard() {
  const toast = useToast()
  const copy = useCallback(
    async (text: string) => {
      const ok = await copyText(text)
      toast(ok ? 'copied' : 'could not copy')
      if (ok) track('copy')
      return ok
    },
    [toast],
  )
  return { copy }
}
