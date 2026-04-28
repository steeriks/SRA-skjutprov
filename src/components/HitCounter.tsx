interface HitCounterProps {
  value: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
}

export default function HitCounter({ value, max, onChange, disabled }: HitCounterProps) {
  const handleDecrement = () => {
    if (value > 0) onChange(value - 1)
  }

  const handleIncrement = () => {
    if (value < max) onChange(value + 1)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleDecrement}
        disabled={disabled || value <= 0}
        className="w-10 h-10 rounded-lg bg-slate-700 text-slate-100 font-bold text-xl flex items-center justify-center disabled:opacity-30 active:bg-slate-600 hover:bg-slate-600 transition-colors touch-manipulation"
      >
        −
      </button>
      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center font-mono font-bold text-lg text-slate-100">
        {value}
      </div>
      <button
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="w-10 h-10 rounded-lg bg-slate-700 text-slate-100 font-bold text-xl flex items-center justify-center disabled:opacity-30 active:bg-slate-600 hover:bg-slate-600 transition-colors touch-manipulation"
      >
        +
      </button>
    </div>
  )
}
