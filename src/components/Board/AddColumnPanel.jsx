import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useTasks } from '../../context/TaskContext'

const PALETTE = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

export default function AddColumnPanel() {
  const { columns, createColumn } = useTasks()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [color, setColor] = useState(PALETTE[0])
  const inputRef = useRef(null)
  const atLimit = columns.length >= 8

  const { setNodeRef, isOver } = useDroppable({ id: '__add-column__' })

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const isDuplicate = columns.some(
    c => c.title.trim().toLowerCase() === title.trim().toLowerCase()
  )
  const isValid = title.trim().length >= 2 && title.trim().length <= 20 && !isDuplicate

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    createColumn({ title: title.trim(), color })
    setTitle('')
    setColor(PALETTE[0])
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); setTitle('') }
  }

  if (!open) {
    return (
      <button
        ref={setNodeRef}
        onClick={() => !atLimit && setOpen(true)}
        disabled={atLimit}
        title={atLimit ? 'Максимум 8 колонок' : 'Добавить колонку'}
        className={`flex-shrink-0 w-[300px] h-full flex flex-col items-center justify-center gap-2
          rounded-xl border-2 border-dashed transition-all duration-200
          ${atLimit
            ? 'opacity-40 cursor-not-allowed dark:border-slate-700 border-slate-300'
            : isOver
              ? 'bg-accent/10 border-accent/60 dark:border-accent/50'
              : 'dark:border-slate-700 border-slate-300 hover:bg-accent/10 hover:border-accent/50 dark:hover:border-accent/50 cursor-pointer'
          }`}
      >
        <span className={`text-2xl leading-none transition-colors duration-200
          ${isOver ? 'text-accent' : 'dark:text-slate-600 text-slate-400'}`}>+</span>
        <span className={`text-xs font-medium transition-colors duration-200
          ${isOver ? 'text-accent' : 'dark:text-slate-500 text-slate-400'}`}>
          {atLimit ? 'Лимит колонок' : 'Добавить колонку'}
        </span>
      </button>
    )
  }

  return (
    <div className="flex-shrink-0 w-[300px] flex flex-col rounded-xl overflow-hidden border
      dark:border-slate-700/60 border-slate-200 shadow-md
      dark:bg-slate-800/60 bg-white">

      <div className="h-1.5 flex-shrink-0" style={{ backgroundColor: color }} />

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col gap-3 p-3">
        <p className="text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-widest">
          Новая колонка
        </p>

        <div className="flex flex-col gap-1">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Название колонки"
            maxLength={20}
            className={`dark:bg-slate-700/60 bg-slate-50 border rounded-xl px-3 py-2 text-sm
              dark:text-white text-slate-900 outline-none transition-colors
              dark:placeholder:text-slate-500 placeholder:text-slate-400
              ${isDuplicate && title.trim()
                ? 'border-red-500'
                : 'dark:border-white/10 border-slate-200 focus:border-accent'
              }`}
          />
          {isDuplicate && title.trim() && (
            <span className="text-red-400 text-xs">Такая колонка уже есть</span>
          )}
          {title.trim().length > 0 && title.trim().length < 2 && (
            <span className="text-red-400 text-xs">Минимум 2 символа</span>
          )}
        </div>

        {/* Color picker */}
        <div className="flex gap-2 flex-wrap">
          {PALETTE.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition-all duration-150 flex-shrink-0
                ${color === c ? 'ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-offset-white' : ''}`}
              style={{ backgroundColor: c, ringColor: c }}
              title={c}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setOpen(false); setTitle('') }}
            className="flex-1 py-1.5 rounded-xl border dark:border-white/10 border-slate-200
              dark:text-slate-400 text-slate-500 text-xs
              dark:hover:bg-white/5 hover:bg-slate-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 py-1.5 rounded-xl bg-accent text-slate-900 text-xs font-semibold
              hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Создать
          </button>
        </div>
      </form>
    </div>
  )
}
