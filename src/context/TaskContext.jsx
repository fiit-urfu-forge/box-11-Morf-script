import { createContext, useContext, useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { MOCK_TASKS, MOCK_COLUMNS } from '../utils/mockData'

const TASKS_KEY   = 'lab_tracker:v1:tasks'
const COLUMNS_KEY = 'lab_tracker:v1:columns'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const [tasks,   setTasks,   storageAvailable] = useLocalStorage(TASKS_KEY,   MOCK_TASKS)
  const [columns, setColumns]                   = useLocalStorage(COLUMNS_KEY, MOCK_COLUMNS)
  const [toasts, setToasts] = useState([])
  const [storageWarned, setStorageWarned] = useState(false)

  // Move orphaned tasks (referencing deleted columns) to 'todo'
  useEffect(() => {
    const colIds = new Set(columns.map(c => c.id))
    const hasOrphans = tasks.some(t => !colIds.has(t.status))
    if (hasOrphans) {
      setTasks(prev =>
        prev.map(t => colIds.has(t.status) ? t : { ...t, status: 'todo', updatedAt: new Date().toISOString() })
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!storageAvailable && !storageWarned) {
      addToast('Локальное хранилище недоступно, данные не сохранятся', 'warning')
      setStorageWarned(true)
    }
  }, [storageAvailable, storageWarned])

  function addToast(message, type = 'success') {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }
  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  function createTask(data) {
    const now = new Date().toISOString()
    const task = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      subtasks: [],
      notes: '',
      activityLog: [],
      ...data,
    }
    setTasks(prev => [...prev, task])
    addToast('Задача добавлена')
    return task
  }

  function updateTask(id, patch) {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)
    )
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
    addToast('Задача удалена')
  }

  function moveTask(id, newStatus) {
    const col = columns.find(c => c.id === newStatus)
    const colTitle = col?.title ?? newStatus
    const now = new Date()
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    const entry = {
      id: crypto.randomUUID(),
      type: 'system',
      text: `Задача перемещена в «${colTitle}» — ${timeStr}`,
      timestamp: now.toISOString(),
    }
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: newStatus, updatedAt: now.toISOString(), activityLog: [...(t.activityLog ?? []), entry] }
          : t
      )
    )
    addToast(`Перемещено в «${colTitle}»`)
  }

  // ── Columns ──────────────────────────────────────────────────────────────
  function createColumn(data) {
    if (columns.length >= 8) return
    const col = { id: crypto.randomUUID(), isSystem: false, order: columns.length, ...data }
    setColumns(prev => [...prev, col])
    addToast(`Колонка «${data.title}» создана`)
    return col
  }

  function deleteColumn(colId, action) {
    if (action === 'move') {
      const now = new Date().toISOString()
      setTasks(prev =>
        prev.map(t => t.status === colId ? { ...t, status: 'todo', updatedAt: now } : t)
      )
    } else {
      setTasks(prev => prev.filter(t => t.status !== colId))
    }
    setColumns(prev => prev.filter(c => c.id !== colId))
    addToast('Колонка удалена')
  }

  return (
    <TaskContext.Provider value={{
      tasks, createTask, updateTask, deleteTask, moveTask,
      columns, createColumn, deleteColumn,
      toasts, removeToast,
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used within TaskProvider')
  return ctx
}
