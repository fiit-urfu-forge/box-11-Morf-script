import { useState } from 'react'

function isStorageAvailable() {
  try {
    localStorage.setItem('__test__', '1')
    localStorage.removeItem('__test__')
    return true
  } catch {
    return false
  }
}

const storageAvailable = isStorageAvailable()

export function useLocalStorage(key, initialValue) {
  const [value, setValueState] = useState(() => {
    if (!storageAvailable) return initialValue
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  function setValue(updater) {
    setValueState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (storageAvailable) {
        try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      }
      return next
    })
  }

  return [value, setValue, storageAvailable]
}
