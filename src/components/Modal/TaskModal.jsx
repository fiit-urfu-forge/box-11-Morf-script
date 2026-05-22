import { useState, useEffect } from 'react'
import { useTasks } from '../../context/TaskContext'

const STATUS_LABELS = {
  todo: 'Не начато',
  'in-progress': 'В работе',
  done: 'Сдано',
}

export default function TaskModal({ task, onClose }) {
  const { createTask, updateTask } = useTasks()
  const isNew = !task

  const [form, setForm] = useState({
    title: task?.title ?? '',
    subject: task?.subject ?? '',
    deadline: task?.deadline ?? '',
    status: task?.status ?? 'todo',
    subtasks: task?.subtasks ?? [],
  })
  const [touched, setTouched] = useState({})
  const [newSubtaskText, setNewSubtaskText] = useState('')

  const valid = form.title.trim().length > 0 && form.deadline.length > 0

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  function addSubtask() {
    if (!newSubtaskText.trim()) return
    setForm(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: crypto.randomUUID(), text: newSubtaskText.trim(), completed: false }],
    }))
    setNewSubtaskText('')
  }

  function toggleSubtask(id) {
    setForm(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s),
    }))
  }

  function removeSubtask(id) {
    setForm(prev => ({ ...prev, subtasks: prev.subtasks.filter(s => s.id !== id) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    const payload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      deadline: form.deadline,
      status: form.status,
      subtasks: form.subtasks,
    }
    if (isNew) createTask(payload)
    else updateTask(task.id, payload)
    onClose()
  }

  const fieldError = name => touched[name] && !form[name].trim()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="dark:bg-slate-800/90 bg-white/90 border dark:border-white/10 border-slate-200
          rounded-xl p-6 shadow-lg backdrop-blur-md w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="dark:text-white text-slate-900 font-semibold text-lg mb-5">
          {isNew ? 'Новая задача' : 'Редактировать задачу'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Название работы *" name="title" value={form.title}
            onChange={handleChange} error={fieldError('title')} maxLength={80} placeholder="Лабораторная №1…" />
          <Field label="Предмет" name="subject" value={form.subject}
            onChange={handleChange} maxLength={40} placeholder="Дискретная математика" />

          <div className="flex flex-col gap-1">
            <label className="dark:text-slate-400 text-slate-600 text-xs">Дедлайн *</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
              onBlur={() => setTouched(p => ({ ...p, deadline: true }))}
              className={`appearance-none dark:bg-slate-700/60 bg-slate-50 border rounded-xl px-3 py-2 text-sm
                dark:text-white text-slate-900 outline-none focus:border-accent transition-colors
                dark:[color-scheme:dark]
                ${fieldError('deadline') ? 'border-red-500' : 'dark:border-white/10 border-slate-200'}`} />
            {fieldError('deadline') && <span className="text-red-400 text-xs">Укажите дедлайн</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="dark:text-slate-400 text-slate-600 text-xs">Статус</label>
            <div className="relative">
              <select name="status" value={form.status} onChange={handleChange}
                className="appearance-none w-full dark:bg-slate-700/60 bg-slate-50 border dark:border-white/10 border-slate-200
                  rounded-xl px-3 py-2 pr-8 text-sm dark:text-white text-slate-900
                  outline-none focus:border-accent transition-colors cursor-pointer">
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-slate-400 text-slate-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Подзадачи */}
          <div className="flex flex-col gap-2">
            <label className="dark:text-slate-400 text-slate-600 text-xs">
              Подзадачи{form.subtasks.length > 0 && (
                <span className="dark:text-slate-500 text-slate-400 ml-1">
                  ({form.subtasks.filter(s => s.completed).length}/{form.subtasks.length})
                </span>
              )}
            </label>

            {form.subtasks.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {form.subtasks.map(st => (
                  <li key={st.id} className="flex items-center gap-2 group/st">
                    <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(st.id)}
                      className="cursor-pointer flex-shrink-0 accent-[#89C15C]" />
                    <span className={`text-sm flex-1 min-w-0 truncate
                      ${st.completed
                        ? 'line-through dark:text-slate-500 text-slate-400'
                        : 'dark:text-slate-200 text-slate-800'}`}>
                      {st.text}
                    </span>
                    <button type="button" onClick={() => removeSubtask(st.id)}
                      className="opacity-0 group-hover/st:opacity-100 flex-shrink-0
                        dark:text-slate-500 text-slate-400 hover:text-red-500 transition-opacity text-base leading-none">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <input type="text" value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
                placeholder="+ Добавить подзадачу"
                className="flex-1 dark:bg-slate-700/60 bg-slate-50 border dark:border-white/10 border-slate-200
                  rounded-xl px-3 py-1.5 text-xs dark:text-white text-slate-900
                  outline-none focus:border-accent transition-colors
                  dark:placeholder:text-slate-600 placeholder:text-slate-400" />
              {newSubtaskText.trim() && (
                <button type="button" onClick={addSubtask}
                  className="px-3 py-1.5 rounded-xl bg-accent/20 text-accent
                    text-xs font-medium hover:bg-accent/30 transition-colors whitespace-nowrap">
                  Добавить
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border dark:border-white/10 border-slate-200
                dark:text-slate-300 text-slate-600 text-sm
                dark:hover:bg-white/5 hover:bg-slate-50 transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={!valid}
              className="flex-1 py-2 rounded-xl bg-accent text-slate-900 text-sm font-semibold
                hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, error, maxLength, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="dark:text-slate-400 text-slate-600 text-xs">{label}</label>
      <input type="text" name={name} value={value} onChange={onChange}
        maxLength={maxLength} placeholder={placeholder}
        className={`dark:bg-slate-700/60 bg-slate-50 border rounded-xl px-3 py-2 text-sm
          dark:text-white text-slate-900 outline-none focus:border-accent transition-colors
          dark:placeholder:text-slate-500 placeholder:text-slate-400
          ${error ? 'border-red-500' : 'dark:border-white/10 border-slate-200'}`} />
      {error && <span className="text-red-400 text-xs">Обязательное поле</span>}
    </div>
  )
}
