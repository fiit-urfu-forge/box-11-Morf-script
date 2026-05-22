import { useTasks } from '../../context/TaskContext'

const config = {
  success: {
    icon: '✓',
    cls: 'dark:border-accent/30 border-accent/40 dark:bg-slate-800/90 bg-white',
    iconCls: 'dark:text-accent text-accent',
  },
  warning: {
    icon: '⚠',
    cls: 'dark:border-yellow-500/40 border-yellow-300 dark:bg-slate-800/90 bg-white',
    iconCls: 'text-yellow-500',
  },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useTasks()

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
      {toasts.map(t => {
        const { icon, cls, iconCls } = config[t.type] ?? config.success
        return (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md
              shadow-lg cursor-pointer transition-all duration-300 animate-slide-up
              text-sm dark:text-white text-slate-900 max-w-xs ${cls}`}
          >
            <span className={`text-base font-bold ${iconCls}`}>{icon}</span>
            <span>{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
