export function relativeTime(isoStr) {
  if (!isoStr) return 'неизвестно'
  const diff = Date.now() - new Date(isoStr).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return 'только что'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} мин. назад`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ч. назад`
  return `${Math.floor(hours / 24)} дн. назад`
}
