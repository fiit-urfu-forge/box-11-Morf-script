import { getUrgency, shouldPulse, urgencyClasses } from '../../utils/urgency'

export default function UrgencyBadge({ deadline, status }) {
  const urgency = getUrgency(deadline, status)
  const pulse = shouldPulse(deadline, status)
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0
        ${urgencyClasses[urgency]} ${pulse ? 'animate-pulse' : ''}`}
      aria-label={urgency}
    />
  )
}
