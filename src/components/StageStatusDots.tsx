import { StageStatus } from '../types'

interface StageStatusDotsProps {
  statuses: StageStatus[]
}

const dotColors: Record<StageStatus, string> = {
  pending: 'bg-slate-600',
  partial: 'bg-yellow-500',
  complete: 'bg-green-500',
}

export default function StageStatusDots({ statuses }: StageStatusDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {statuses.map((status, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${dotColors[status]}`}
          title={`Moment ${i + 1}: ${status}`}
        />
      ))}
    </div>
  )
}
