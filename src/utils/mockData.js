const uid = () => crypto.randomUUID()

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export const MOCK_COLUMNS = [
  { id: 'todo',        title: 'Не начато', color: '#ef4444', isSystem: true, order: 0 },
  { id: 'in-progress', title: 'В работе',  color: '#f59e0b', isSystem: true, order: 1 },
  { id: 'done',        title: 'Сдано',     color: '#64748b', isSystem: true, order: 2 },
]

export const MOCK_TASKS = [
  {
    id: uid(),
    title: 'Дискретная математика (Кащенко Н.М)',
    subject: 'Дискр. математика',
    deadline: daysFromNow(1),
    status: 'in-progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: '',
    activityLog: [],
    subtasks: [
      { id: uid(), text: 'Доделать задачи 1-5', completed: false },
      { id: uid(), text: 'Оформить отчёт',      completed: false },
    ],
  },
  {
    id: uid(),
    title: 'Операционки (Норин Д.Е)',
    subject: 'Операционные системы',
    deadline: daysFromNow(-2),
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: '',
    activityLog: [],
    subtasks: [
      { id: uid(), text: 'Прочитать теорию', completed: true  },
      { id: uid(), text: 'Написать отчёт',   completed: false },
    ],
  },
  {
    id: uid(),
    title: 'Компьютерные сети (Шадрин Д.Б)',
    subject: 'Компьютерные сети',
    deadline: daysFromNow(5),
    status: 'in-progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: '',
    activityLog: [],
    subtasks: [
      { id: uid(), text: 'Прочитать теорию',      completed: true  },
      { id: uid(), text: 'Настроить топологию',   completed: true  },
      { id: uid(), text: 'Написать отчёт',         completed: false },
    ],
  },
  {
    id: uid(),
    title: 'Базы данных (Воронов С.М)',
    subject: 'Базы данных',
    deadline: daysFromNow(12),
    status: 'done',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: '',
    activityLog: [],
    subtasks: [
      { id: uid(), text: 'ER-диаграмма',  completed: true },
      { id: uid(), text: 'SQL-запросы',   completed: true },
    ],
  },
]
