import { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core'
import Column from './Column'
import AddColumnPanel from './AddColumnPanel'
import TaskCard from '../Card/TaskCard'
import TaskModal from '../Modal/TaskModal'
import ToastContainer from '../Toast/Toast'
import TaskSidebar from '../Sidebar/TaskSidebar'
import { useTasks } from '../../context/TaskContext'

const SORT_OPTIONS = {
  deadline:  { label: 'По дедлайну', next: 'createdAt' },
  createdAt: { label: 'По дате',     next: 'deadline'  },
}

export default function Board({ isDark, onToggleTheme }) {
  const { tasks, columns, moveTask } = useTasks()
  const [adding, setAdding]               = useState(false)
  const [activeTask, setActiveTask]       = useState(null)
  const [filterText, setFilterText]       = useState('')
  const [sortBy, setSortBy]               = useState('deadline')
  const [focusColumn, setFocusColumn]     = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  const filterRef = useRef(null)

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null

  // Close sidebar if task deleted
  useEffect(() => {
    if (selectedTaskId && !selectedTask) setSelectedTaskId(null)
  }, [tasks, selectedTaskId, selectedTask])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'n') { e.preventDefault(); setAdding(true) }
      if (ctrl && e.key === 'f') { e.preventDefault(); filterRef.current?.focus(); filterRef.current?.select() }
      if (e.key === 'Escape')     setSelectedTaskId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)
  const visibleColumns = focusColumn
    ? sortedColumns.filter(c => c.id === focusColumn)
    : sortedColumns

  function tasksByColumn(colId) {
    return tasks
      .filter(t => t.status === colId)
      .sort((a, b) => sortBy === 'deadline'
        ? new Date(a.deadline) - new Date(b.deadline)
        : new Date(a.createdAt) - new Date(b.createdAt)
      )
  }

  function handleDragStart({ active }) {
    setActiveTask(tasks.find(t => t.id === active.id) ?? null)
  }

  function handleDragEnd({ active, over }) {
    setActiveTask(null)
    if (!over) return
    const dragged = tasks.find(t => t.id === active.id)
    if (!dragged) return
    const isCol    = columns.some(c => c.id === over.id)
    const targetStatus = isCol ? over.id : tasks.find(t => t.id === over.id)?.status
    if (targetStatus && targetStatus !== dragged.status) moveTask(dragged.id, targetStatus)
  }

  const doneCount = tasks.filter(t => t.status === 'done').length
  const total     = tasks.length
  const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const focusColId = sortedColumns[1]?.id ?? sortedColumns[0]?.id

  return (
    <div className="h-screen flex flex-col overflow-hidden dark:bg-[#0f172a] bg-[#F7F9FB] transition-colors duration-300">

      {/* Header */}
      <header className="flex-shrink-0 px-6 pt-4 pb-3 border-b dark:border-white/5 border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="dark:text-white text-slate-900 font-bold text-xl tracking-tight">Lab Tracker</h1>
          <div className="flex items-center gap-2">
            <button onClick={onToggleTheme}
              className="p-2 rounded-xl dark:text-slate-400 text-slate-500 dark:hover:bg-white/5 hover:bg-slate-100 transition-colors"
              aria-label="Переключить тему">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button onClick={() => setAdding(true)} title="Ctrl+N"
              className="flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-slate-900
                text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-accent/20">
              <span className="text-lg leading-none">+</span>
              Добавить
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs dark:text-slate-400 text-slate-500 whitespace-nowrap tabular-nums">
              {doneCount} / {total} сдано
            </span>
            <div className="w-24 h-1.5 rounded-full dark:bg-slate-700 bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs dark:text-slate-500 text-slate-400 font-medium tabular-nums w-8">{pct}%</span>
          </div>

          <div className="flex-1" />

          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400 pointer-events-none" />
            <input ref={filterRef} type="text" value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Фильтр по предмету" title="Ctrl+F"
              className="pl-8 pr-7 py-1.5 text-xs rounded-xl w-44 dark:bg-slate-800 bg-white
                border dark:border-slate-700 border-slate-200 dark:text-slate-300 text-slate-700
                dark:placeholder:text-slate-600 placeholder:text-slate-400
                outline-none focus:border-accent transition-colors" />
            {filterText && (
              <button onClick={() => setFilterText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400 hover:dark:text-slate-300 hover:text-slate-700 transition-colors">
                <ClearIcon />
              </button>
            )}
          </div>

          <button onClick={() => setSortBy(SORT_OPTIONS[sortBy].next)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
              border dark:border-slate-700 border-slate-200 dark:text-slate-300 text-slate-600
              dark:hover:bg-slate-800 hover:bg-slate-100 dark:bg-slate-800/50 bg-white
              transition-colors whitespace-nowrap">
            <SortIcon />
            {SORT_OPTIONS[sortBy].label}
          </button>

          <button onClick={() => setFocusColumn(c => c ? null : focusColId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap
              ${focusColumn
                ? 'bg-accent border-accent text-slate-900 font-semibold hover:bg-accent/90'
                : 'dark:border-slate-700 border-slate-200 dark:text-slate-300 text-slate-600 dark:hover:bg-slate-800 hover:bg-slate-100 dark:bg-slate-800/50 bg-white'
              }`}>
            <FocusIcon />
            {focusColumn ? 'Все колонки' : 'Фокус'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Board area with horizontal scroll */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
              <div className="flex h-full gap-4 px-6 pt-4 pb-6 min-w-min">
                {visibleColumns.map(col => (
                  <Column
                    key={col.id}
                    column={col}
                    tasks={tasksByColumn(col.id)}
                    filterText={filterText}
                    onCardClick={setSelectedTaskId}
                  />
                ))}
                {!focusColumn && <AddColumnPanel />}
              </div>
            </div>
            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Sidebar */}
        <div className={`flex-shrink-0 border-l dark:border-slate-700/60 border-slate-200
          transition-all duration-300 ease-in-out overflow-hidden
          ${selectedTask ? 'w-[30%] min-w-[360px] max-w-[450px]' : 'w-0 border-l-0'}`}>
          {selectedTask && (
            <TaskSidebar
              key={selectedTask.id}
              task={selectedTask}
              onClose={() => setSelectedTaskId(null)}
            />
          )}
        </div>
      </div>

      {adding && <TaskModal onClose={() => setAdding(false)} />}
      <ToastContainer />
    </div>
  )
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
function SearchIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function ClearIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function SortIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="18" x2="11" y2="18" />
      <polyline points="3 8 6 5 9 8" /><line x1="6" y1="5" x2="6" y2="19" />
    </svg>
  )
}
function FocusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M3 9V6a1 1 0 0 1 1-1h3M15 5h3a1 1 0 0 1 1 1v3M21 15v3a1 1 0 0 1-1 1h-3M9 21H6a1 1 0 0 1-1-1v-3" />
    </svg>
  )
}
