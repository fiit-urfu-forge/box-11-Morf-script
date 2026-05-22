import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTasks } from '../../context/TaskContext'
import { getUrgency, shouldPulse, urgencyClasses } from '../../utils/urgency'
import { relativeTime } from '../../utils/time'
import ConfirmModal from '../Modal/ConfirmModal'

export default function TaskCard({ task, filterText = '', onCardClick }) {
  const { deleteTask } = useTasks()
  const [confirming, setConfirming] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const urgency = getUrgency(task.deadline, task.status)
  const pulse = shouldPulse(task.deadline, task.status)

  const isDimmed = filterText.length > 0 &&
    !task.subject.toLowerCase().includes(filterText.toLowerCase())

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : isDimmed ? 0.3 : 1,
  }

  const titleText    = task.title.length > 50 ? task.title.slice(0, 50) + '…'   : task.title
  const subjectText  = task.subject.length > 20 ? task.subject.slice(0, 20) + '…' : task.subject
  const deadlineLabel = new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

  const subtasks = task.subtasks ?? []
  const doneSub  = subtasks.filter(s => s.completed).length
  const subPct   = subtasks.length > 0 ? Math.round(doneSub / subtasks.length * 100) : 0

  const avatarInitial = task.subject ? task.subject.charAt(0).toUpperCase() : '?'

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => onCardClick?.(task.id)}
        className="group relative rounded-2xl overflow-hidden border
          dark:border-white/10 border-slate-200
          dark:bg-white/5 bg-white
          dark:hover:border-accent/40 hover:border-accent/50
          shadow-md hover:shadow-lg hover:-translate-y-0.5
          cursor-pointer transition-all duration-200 select-none"
      >
        {/* Urgency stripe */}
        <div className={`h-[3px] w-full ${urgencyClasses[urgency]} ${pulse ? 'animate-pulse' : ''}`} />

        <div className="p-3 flex flex-col gap-1.5">
          {/* Row 1: subject pill + clock */}
          <div className="flex items-center gap-2">
            {task.subject ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                dark:bg-accent/20 bg-accent/15 dark:text-accent text-accent
                truncate max-w-[140px] leading-tight">
                {subjectText}
              </span>
            ) : (
              <span className="flex-1" />
            )}
            <div className="ml-auto flex-shrink-0 relative group/clock" onClick={e => e.stopPropagation()}>
              <div className="dark:text-slate-600 text-slate-300 cursor-default">
                <ClockIcon />
              </div>
              <div className="absolute bottom-full right-0 mb-1.5 z-20 px-2 py-1 rounded-xl text-xs
                whitespace-nowrap pointer-events-none
                opacity-0 group-hover/clock:opacity-100 transition-opacity duration-150
                dark:bg-slate-700 bg-white dark:text-slate-300 text-slate-700
                border dark:border-slate-600 border-slate-200 shadow-lg">
                {relativeTime(task.updatedAt ?? task.createdAt)}
              </div>
            </div>
          </div>

          {/* Row 2: title */}
          <p className="text-sm font-semibold dark:text-white text-slate-900 leading-tight"
            title={task.title}>
            {titleText}
          </p>

          {/* Row 3: subtask progress */}
          {subtasks.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full dark:bg-slate-700 bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${subPct}%` }} />
              </div>
              <span className="text-[10px] dark:text-slate-500 text-slate-400 tabular-nums flex-shrink-0">
                {doneSub}/{subtasks.length}
              </span>
            </div>
          )}

          {/* Row 4: deadline + chat icon + avatar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs dark:text-slate-500 text-slate-400">
              <CalendarIcon />
              <span>до {deadlineLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity dark:text-slate-500 text-slate-400">
                <ChatIcon />
              </div>
              <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-accent leading-none">{avatarInitial}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={e => { e.stopPropagation(); setConfirming(true) }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
            dark:text-slate-400 text-slate-400 hover:text-red-500
            p-1 rounded-lg dark:hover:bg-red-500/10 hover:bg-red-50"
          aria-label="Удалить задачу"
        >
          <TrashIcon />
        </button>
      </div>

      {confirming && (
        <ConfirmModal
          message="Точно удалить задачу?"
          onConfirm={() => { deleteTask(task.id); setConfirming(false) }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
