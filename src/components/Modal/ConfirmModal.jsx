import { useEffect } from 'react'

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="dark:bg-slate-800/95 bg-white border dark:border-white/10 border-slate-200
          rounded-2xl p-6 shadow-2xl backdrop-blur-xl max-w-sm w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <p className="dark:text-white text-slate-900 text-base font-medium mb-6 text-center">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border dark:border-white/10 border-slate-200
              dark:text-slate-300 text-slate-600 text-sm
              dark:hover:bg-white/5 hover:bg-slate-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium
              hover:bg-red-600 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}
