import { useUiStore } from '@/store/ui.store'
import { Toast } from '@/components/toast/Toast'

/** bottom-centre stack, announced politely */
export function ToastHost() {
  const toasts = useUiStore((s) => s.toasts)
  const dismiss = useUiStore((s) => s.dismissToast)
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-10 z-50 flex flex-col items-center gap-2"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}
