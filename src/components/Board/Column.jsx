import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from '../Card/TaskCard'
import { useTasks } from '../../context/TaskContext'

export default function Column({ column, tasks, filterText, onCardClick }) {
  const { deleteColumn } = useTasks()
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const [deleteDialog, setDeleteDialog] = useState(false)

  return (
    <>
      <div
        className={`flex-shrink-0 w-[320px] flex flex-col rounded-xl overflow-hidden border transition-all duration-200
          ${isOver
            ? 'dark:border-accent/50 border-accent/60 shadow-lg shadow-accent/10'
            : 'dark:border-slate-700/60 border-slate-200 shadow-md'
          }`}
      >
        {/* Colored top bar */}
        <div className="h-1.5 flex-shrink-0" style={{ backgroundColor: column.color }} />

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0
          dark:bg-slate-800/60 bg-white border-b dark:border-slate-700/40 border-slate-100">
          <h2 className="text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-widest truncate">
            {column.title}
          </h2>
          <span className="ml-auto text-xs dark:text-slate-500 text-slate-400
            dark:bg-slate-700/50 bg-slate-100 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
            {tasks.length}
          </span>
          {!column.isSystem && (
            <button
              onClick={() => setDeleteDialog(true)}
              className="flex-shrink-0 dark:text-slate-600 text-slate-300
                hover:text-red-500 transition-colors text-base leading-none p-0.5 rounded"
              title="Удалить колонку"
            >
              ×
            </button>
          )}
        </div>

        {/* Cards */}
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className={`flex flex-col gap-2 p-2 overflow-y-auto flex-1 min-h-0 transition-colors duration-200
              dark:bg-slate-800/30 bg-slate-50
              ${isOver
                ? 'dark:bg-accent/20 bg-accent/15'
                : tasks.length === 0 ? 'hover:bg-accent/10 dark:hover:bg-accent/10' : ''
              }
              ${tasks.length === 0
                ? 'border-2 border-dashed dark:border-slate-700 border-slate-200 rounded-b-xl m-1'
                : ''}`}
          >
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} filterText={filterText} onCardClick={onCardClick} />
            ))}
          </div>
        </SortableContext>
      </div>

      {deleteDialog && (
        <DeleteColumnDialog
          column={column}
          taskCount={tasks.length}
          onConfirm={action => { deleteColumn(column.id, action); setDeleteDialog(false) }}
          onCancel={() => setDeleteDialog(false)}
        />
      )}
    </>
  )
}

function DeleteColumnDialog({ column, taskCount, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="dark:bg-slate-800/95 bg-white border dark:border-white/10 border-slate-200
          rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <p className="dark:text-white text-slate-900 text-base font-semibold mb-2">
          Удалить колонку «{column.title}»?
        </p>

        {taskCount > 0 ? (
          <>
            <p className="dark:text-slate-400 text-slate-500 text-sm mb-5">
              В колонке {taskCount} {taskCount === 1 ? 'задача' : taskCount < 5 ? 'задачи' : 'задач'}. Что с ними сделать?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onConfirm('move')}
                className="w-full py-2.5 rounded-xl bg-accent text-slate-900 text-sm font-semibold
                  hover:bg-accent/90 transition-colors"
              >
                Перенести в «Не начато»
              </button>
              <button
                onClick={() => onConfirm('delete')}
                className="w-full py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium
                  hover:bg-red-600 transition-colors"
              >
                Удалить вместе с задачами
              </button>
              <button
                onClick={onCancel}
                className="w-full py-2 rounded-xl border dark:border-white/10 border-slate-200
                  dark:text-slate-300 text-slate-600 text-sm
                  dark:hover:bg-white/5 hover:bg-slate-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="dark:text-slate-400 text-slate-500 text-sm mb-5">
              Колонка пустая, это действие необратимо.
            </p>
            <div className="flex gap-3">
              <button onClick={onCancel}
                className="flex-1 py-2 rounded-xl border dark:border-white/10 border-slate-200
                  dark:text-slate-300 text-slate-600 text-sm
                  dark:hover:bg-white/5 hover:bg-slate-50 transition-colors">
                Отмена
              </button>
              <button onClick={() => onConfirm('delete')}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium
                  hover:bg-red-600 transition-colors">
                Удалить
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
