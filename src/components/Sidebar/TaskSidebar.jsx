import { useState, useRef, useEffect } from 'react'
import { useTasks } from '../../context/TaskContext'
import { getUrgency, urgencyClasses } from '../../utils/urgency'
import { relativeTime } from '../../utils/time'
import TaskModal from '../Modal/TaskModal'
import ConfirmModal from '../Modal/ConfirmModal'

const TABS = ['Подзадачи', 'Чат', 'Описание']

const STATUS_LABEL = { todo: 'Не начато', 'in-progress': 'В работе', done: 'Сдано' }
const STATUS_COLOR = {
  todo:        'dark:bg-red-500/20 bg-red-100 dark:text-red-400 text-red-600',
  'in-progress': 'dark:bg-yellow-500/20 bg-yellow-100 dark:text-yellow-400 text-yellow-600',
  done:        'dark:bg-green-500/20 bg-green-100 dark:text-green-400 text-green-600',
}

export default function TaskSidebar({ task, onClose }) {
  const { updateTask, deleteTask } = useTasks()
  const [activeTab, setActiveTab] = useState('Подзадачи')
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const urgency = getUrgency(task.deadline, task.status)
  const subtasks = task.subtasks ?? []
  const doneSub  = subtasks.filter(s => s.completed).length
  const subPct   = subtasks.length > 0 ? Math.round(doneSub / subtasks.length * 100) : 0

  const [newSubtask, setNewSubtask] = useState('')

  function toggleSubtask(id) {
    updateTask(task.id, {
      subtasks: subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s),
    })
  }
  function addSubtask() {
    if (!newSubtask.trim()) return
    updateTask(task.id, {
      subtasks: [...subtasks, { id: crypto.randomUUID(), text: newSubtask.trim(), completed: false }],
    })
    setNewSubtask('')
  }
  function removeSubtask(id) {
    updateTask(task.id, { subtasks: subtasks.filter(s => s.id !== id) })
  }

  return (
    <>
      <aside className="flex flex-col w-full h-full dark:bg-slate-900/90 bg-white/95 backdrop-blur-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b dark:border-slate-700/40 border-slate-200 flex-shrink-0">
          <button onClick={onClose}
            className="flex items-center gap-1.5 text-xs dark:text-slate-400 text-slate-500
              dark:hover:text-white hover:text-slate-900 transition-colors group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            К списку
          </button>
          <div className="flex-1" />
          <button onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg dark:text-slate-400 text-slate-500
              dark:hover:bg-slate-700 hover:bg-slate-100 transition-colors" title="Редактировать">
            <EditIcon />
          </button>
          <button onClick={() => setConfirming(true)}
            className="p-1.5 rounded-lg dark:text-slate-400 text-slate-500
              hover:text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50 transition-colors" title="Удалить">
            <TrashIcon />
          </button>
        </div>

        {/* Task preview */}
        <div className="px-4 pt-3 pb-3 border-b dark:border-slate-700/40 border-slate-200 flex-shrink-0">
          <div className={`h-1 rounded-full mb-2.5 w-8 ${urgencyClasses[urgency]}`} />
          <p className="text-sm font-semibold dark:text-white text-slate-900 leading-snug mb-1.5"
            title={task.title}>{task.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs dark:text-slate-400 text-slate-500">{task.subject}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[task.status] ?? STATUS_COLOR.todo}`}>
              {STATUS_LABEL[task.status] ?? task.status}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b dark:border-slate-700/40 border-slate-200 flex-shrink-0">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors relative
                ${activeTab === tab
                  ? 'dark:text-accent text-accent'
                  : 'dark:text-slate-500 text-slate-400 dark:hover:text-slate-300 hover:text-slate-600'
                }`}>
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {activeTab === 'Подзадачи' && (
            <SubtasksTab
              subtasks={subtasks} doneSub={doneSub} subPct={subPct}
              newSubtask={newSubtask} setNewSubtask={setNewSubtask}
              onToggle={toggleSubtask} onRemove={removeSubtask} onAdd={addSubtask}
            />
          )}
          {activeTab === 'Чат' && (
            <ChatTab task={task} updateTask={updateTask} />
          )}
          {activeTab === 'Описание' && (
            <DescriptionTab task={task} updateTask={updateTask} />
          )}
        </div>
      </aside>

      {editing && <TaskModal task={task} onClose={() => setEditing(false)} />}
      {confirming && (
        <ConfirmModal
          message="Точно удалить задачу?"
          onConfirm={() => { deleteTask(task.id); setConfirming(false); onClose() }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}

/* ── Subtasks tab ────────────────────────────────────── */
function SubtasksTab({ subtasks, doneSub, subPct, newSubtask, setNewSubtask, onToggle, onRemove, onAdd }) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {subtasks.length > 0 && (
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex justify-between text-xs dark:text-slate-400 text-slate-500 mb-2">
            <span>Прогресс</span>
            <span className="tabular-nums font-medium">{doneSub}/{subtasks.length} · {subPct}%</span>
          </div>
          <div className="h-2 rounded-full dark:bg-slate-700/60 bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${subPct}%` }} />
          </div>
        </div>
      )}

      <ul className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5">
        {subtasks.length === 0 && (
          <li className="flex items-center justify-center h-24 text-xs dark:text-slate-600 text-slate-400">
            Нет подзадач
          </li>
        )}
        {subtasks.map(st => (
          <li key={st.id}
            className="flex items-center gap-3 px-2 py-2.5 rounded-xl group
              dark:hover:bg-slate-800 hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked={st.completed} onChange={() => onToggle(st.id)}
              className="accent-[#89C15C] w-4 h-4 cursor-pointer flex-shrink-0 rounded" />
            <span className={`text-sm flex-1 min-w-0 leading-snug transition-colors
              ${st.completed ? 'line-through dark:text-slate-500 text-slate-400' : 'dark:text-slate-200 text-slate-800'}`}>
              {st.text}
            </span>
            <button onClick={() => onRemove(st.id)}
              className="opacity-0 group-hover:opacity-100 text-lg leading-none
                dark:text-slate-600 text-slate-300 hover:text-red-500 transition-opacity">
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="px-3 pb-3 pt-2 border-t dark:border-slate-700/40 border-slate-100 flex gap-2 flex-shrink-0">
        <input type="text" value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd() } }}
          placeholder="Добавить подзадачу..."
          className="flex-1 dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-200
            rounded-xl px-3 py-2 text-sm dark:text-white text-slate-900 outline-none
            focus:border-accent transition-colors dark:placeholder:text-slate-600 placeholder:text-slate-400" />
        <button onClick={onAdd} disabled={!newSubtask.trim()}
          className="px-3 py-2 rounded-xl bg-accent text-slate-900 text-sm font-semibold
            hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          +
        </button>
      </div>
    </div>
  )
}

/* ── Chat tab ────────────────────────────────────────── */
function ChatTab({ task, updateTask }) {
  const [msgInput, setMsgInput] = useState('')
  const endRef = useRef(null)
  const activityLog = task.activityLog ?? []

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activityLog])

  function sendMessage() {
    if (!msgInput.trim()) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    const entry = {
      id: crypto.randomUUID(),
      type: 'user',
      text: msgInput.trim(),
      timestamp: now.toISOString(),
      timeStr,
    }
    updateTask(task.id, { activityLog: [...activityLog, entry] })
    setMsgInput('')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {activityLog.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 h-full
            dark:text-slate-600 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-xs">Нет активности</p>
          </div>
        ) : (
          activityLog.map(entry => (
            entry.type === 'system' ? (
              <div key={entry.id} className="flex justify-center">
                <span className="text-[10px] dark:text-slate-500 text-slate-400
                  dark:bg-slate-800 bg-slate-100 px-3 py-1 rounded-full">
                  {entry.text}
                </span>
              </div>
            ) : (
              <div key={entry.id} className="flex flex-col items-end gap-1">
                <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-br-sm
                  bg-accent text-slate-900 text-sm leading-snug font-medium">
                  {entry.text}
                </div>
                <span className="text-[10px] dark:text-slate-600 text-slate-400">
                  {relativeTime(entry.timestamp)}
                </span>
              </div>
            )
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="px-3 py-3 border-t dark:border-slate-700/40 border-slate-200 flex gap-2 flex-shrink-0">
        <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
          placeholder="Написать заметку..."
          className="flex-1 dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-200
            rounded-xl px-3 py-2 text-sm dark:text-white text-slate-900 outline-none
            focus:border-accent transition-colors
            dark:placeholder:text-slate-600 placeholder:text-slate-400" />
        <button onClick={sendMessage} disabled={!msgInput.trim()}
          className="p-2 rounded-xl bg-accent text-slate-900 hover:bg-accent/90
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <SendIcon />
        </button>
      </div>
    </div>
  )
}

/* ── Description tab ─────────────────────────────────── */
function DescriptionTab({ task, updateTask }) {
  const [notes, setNotes] = useState(task.notes ?? '')

  function handleBlur() {
    if (notes !== (task.notes ?? '')) {
      updateTask(task.id, { notes })
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden px-3 py-3 gap-2">
      <p className="text-xs dark:text-slate-500 text-slate-400 flex-shrink-0">
        Заметки по лабораторной (Markdown)
      </p>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder="# Цель работы&#10;&#10;Описание, ссылки, заметки..."
        className="flex-1 w-full resize-none dark:bg-slate-800 bg-slate-50
          border dark:border-slate-700 border-slate-200 rounded-xl px-3 py-2.5
          text-sm dark:text-slate-200 text-slate-800 outline-none
          focus:border-accent transition-colors leading-relaxed
          dark:placeholder:text-slate-600 placeholder:text-slate-400"
      />
    </div>
  )
}

/* ── Icons ───────────────────────────────────────────── */
function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
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
function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
