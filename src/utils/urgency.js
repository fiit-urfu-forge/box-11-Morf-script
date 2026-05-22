const H24 = 24 * 60 * 60 * 1000
const H72 = 72 * 60 * 60 * 1000
const H7D =  7 * 24 * 60 * 60 * 1000

export function getUrgency(deadline, status) {
  if (status === 'done') return 'done'
  const diff = new Date(deadline) - Date.now()
  if (diff > H7D) return 'green'
  if (diff > H72) return 'yellow'
  return 'red'
}

// Pulse: overdue OR less than 24 h remaining
export function shouldPulse(deadline, status) {
  if (status === 'done') return false
  return new Date(deadline) - Date.now() < H24
}

export const urgencyClasses = {
  green:  'bg-emerald-500',
  yellow: 'bg-yellow-400',
  red:    'bg-red-500',
  done:   'bg-slate-500',
}
