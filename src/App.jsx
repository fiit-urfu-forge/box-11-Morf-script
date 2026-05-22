import { TaskProvider } from './context/TaskContext'
import Board from './components/Board/Board'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const [isDark, toggleTheme] = useTheme()
  return (
    <div className={isDark ? 'dark' : ''}>
      <TaskProvider>
        <Board isDark={isDark} onToggleTheme={toggleTheme} />
      </TaskProvider>
    </div>
  )
}
