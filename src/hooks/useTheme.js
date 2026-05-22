import { useState, useEffect } from 'react'

const THEME_KEY = 'lab_tracker:v1:theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      return saved ? saved === 'dark' : true
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
    } catch { /* ignore */ }
  }, [isDark])

  return [isDark, () => setIsDark(d => !d)]
}
