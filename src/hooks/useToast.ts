import { useUiStore } from '@/store/ui.store'

export function useToast() {
  return useUiStore((s) => s.pushToast)
}
