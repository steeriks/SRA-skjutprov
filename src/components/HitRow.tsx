import HitCounter from './HitCounter'

interface HitRowProps {
  hitType: string
  points: number
  maxTarget1: number
  maxTarget2: number
  valueTarget1: number
  valueTarget2: number
  onChangeTarget1: (v: number) => void
  onChangeTarget2: (v: number) => void
  disabled?: boolean
}

const hitTypeColors: Record<string, string> = {
  A: 'text-green-400',
  C: 'text-blue-400',
  D: 'text-yellow-400',
  M: 'text-red-400',
  P: 'text-orange-400',
}

export default function HitRow({
  hitType,
  points,
  maxTarget1,
  maxTarget2,
  valueTarget1,
  valueTarget2,
  onChangeTarget1,
  onChangeTarget2,
  disabled,
}: HitRowProps) {
  const colorClass = hitTypeColors[hitType] ?? 'text-slate-300'
  const ptsLabel = points > 0 ? `+${points}` : `${points}`

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-10 flex flex-col items-center">
        <span className={`text-lg font-bold ${colorClass}`}>{hitType}</span>
        <span className="text-xs text-slate-500">{ptsLabel}</span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-slate-500">T1</span>
          <HitCounter value={valueTarget1} max={maxTarget1} onChange={onChangeTarget1} disabled={disabled} />
        </div>
        <div className="w-px h-12 bg-slate-700" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-slate-500">T2</span>
          <HitCounter value={valueTarget2} max={maxTarget2} onChange={onChangeTarget2} disabled={disabled} />
        </div>
      </div>
      <div className="w-14 text-right">
        <span className="text-sm font-mono text-slate-300">
          {(valueTarget1 + valueTarget2) * points > 0
            ? `+${(valueTarget1 + valueTarget2) * points}`
            : (valueTarget1 + valueTarget2) * points !== 0
            ? `${(valueTarget1 + valueTarget2) * points}`
            : '0'}
        </span>
      </div>
    </div>
  )
}
