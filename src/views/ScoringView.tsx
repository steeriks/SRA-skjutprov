import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import HitRow from '../components/HitRow'
import { useStore } from '../store/useStore'
import {
  calcStagePoints,
  calcStageTime,
  calcHitFactor,
  formatTime,
  formatHF,
  getStageStatus,
  parseTimeInput,
  STAGE_DESCRIPTIONS,
} from '../lib/sra'
import { announceShooter } from '../lib/speech'
import {
  HIT_TYPES,
  HIT_POINTS,
  SHOT_COUNTS,
  TIME_COUNTS,
  STAGE_NAMES,
  STAGE_SHORT_NAMES,
  WeaponType,
} from '../types'

export default function ScoringView() {
  const { stage: stageParam, shooter: shooterParam } = useParams<{ stage: string; shooter: string }>()
  const navigate = useNavigate()

  const stageIndex = parseInt(stageParam ?? '0', 10)
  const shooterName = decodeURIComponent(shooterParam ?? '')

  const {
    shooters,
    scores,
    times,
    disqualifications,
    stage5Type,
    muted,
    shooterOrder,
    setScore,
    setTime,
    setDisqualification,
    rotateShooters,
  } = useStore()

  const [showDesc, setShowDesc] = useState(false)
  const [dqInput, setDqInput] = useState('')
  const [showDQ, setShowDQ] = useState(false)
  const [timeInputs, setTimeInputs] = useState<string[]>([])

  const weaponType: WeaponType = stageIndex === 4 ? (stage5Type[shooterName] ?? 'pistol') : 'pistol'
  const shotCounts = SHOT_COUNTS[weaponType][stageIndex]
  const timeCount = TIME_COUNTS[stageIndex]
  const stageDesc = STAGE_DESCRIPTIONS[stageIndex]
  const isDQ = !!disqualifications[shooterName]

  const shooterScores = scores[shooterName]?.[stageIndex] ?? HIT_TYPES.map(() => [0, 0])
  const shooterTimes = times[shooterName]?.[stageIndex] ?? Array(timeCount).fill(0)

  // Initialize time inputs from store
  useEffect(() => {
    setTimeInputs(shooterTimes.map((t) => (t > 0 ? String(t) : '')))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex, shooterName])

  // Announce shooter on mount / when shooter or stage changes
  useEffect(() => {
    const stageName = STAGE_SHORT_NAMES[stageIndex]
    announceShooter(`Stage ${stageIndex + 1}, ${stageName}`, shooterName, muted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex, shooterName])

  const totalPoints = calcStagePoints(shooterScores)
  const totalTime = calcStageTime(shooterTimes)
  const hf = calcHitFactor(totalPoints, totalTime)
  const status = getStageStatus(shooterScores, shooterTimes, stageIndex, weaponType)

  // Navigation helpers
  const currentShooterIndex = shooters.indexOf(shooterName)
  const nextShooterIndex = (currentShooterIndex + 1) % shooters.length
  const prevShooterIndex = (currentShooterIndex - 1 + shooters.length) % shooters.length

  const handlePrevShooter = () => {
    const prevShooter = shooters[prevShooterIndex]
    navigate(`/scoring/${stageIndex}/${encodeURIComponent(prevShooter)}`)
  }

  const handleNextShooter = () => {
    const isLastShooter = currentShooterIndex === shooters.length - 1
    const nextShooter = shooters[nextShooterIndex]

    if (isLastShooter) {
      // Move to next stage
      const nextStage = stageIndex + 1
      if (nextStage >= 5) {
        // All stages done
        navigate('/')
        return
      }
      // Rotate if needed
      if (shooterOrder === 'rotating') {
        rotateShooters()
        // After rotation, first shooter is the new first
        const rotated = [...shooters.slice(1), shooters[0]]
        navigate(`/scoring/${nextStage}/${encodeURIComponent(rotated[0])}`)
      } else {
        navigate(`/scoring/${nextStage}/${encodeURIComponent(shooters[0])}`)
      }
    } else {
      navigate(`/scoring/${stageIndex}/${encodeURIComponent(nextShooter)}`)
    }
  }

  const handleTimeInputChange = (idx: number, val: string) => {
    const newInputs = [...timeInputs]
    newInputs[idx] = val
    setTimeInputs(newInputs)
  }

  const handleTimeInputBlur = (idx: number) => {
    const raw = timeInputs[idx]
    if (!raw.trim()) {
      setTime(shooterName, stageIndex, idx, 0)
      return
    }
    const parsed = parseTimeInput(raw)
    setTime(shooterName, stageIndex, idx, parsed)
    setTimeInputs((prev) => {
      const updated = [...prev]
      updated[idx] = parsed > 0 ? parsed.toFixed(2) : ''
      return updated
    })
  }

  const handleDQ = () => {
    if (!dqInput.trim()) return
    setDisqualification(shooterName, dqInput.trim())
    setShowDQ(false)
    setDqInput('')
  }

  // Shot total per target
  const targetTotals = shotCounts.map((_, ti) =>
    HIT_TYPES.reduce((sum, _, hi) => sum + (shooterScores[hi]?.[ti] ?? 0), 0)
  )

  return (
    <Layout
      title={`Stage ${stageIndex + 1} — ${shooterName}`}
      backTo="/"
      rightAction={
        <Link
          to={`/shooter/${encodeURIComponent(shooterName)}`}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-700 text-slate-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </Link>
      }
    >
      <div className="p-4 space-y-3 max-w-xl mx-auto pb-32">
        {/* Stage selector tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {Array.from({ length: 5 }, (_, i) => {
            const s = getStageStatus(
              scores[shooterName]?.[i],
              times[shooterName]?.[i],
              i,
              i === 4 ? (stage5Type[shooterName] ?? 'pistol') : 'pistol'
            )
            const dotColor = s === 'complete' ? 'bg-green-500' : s === 'partial' ? 'bg-yellow-500' : 'bg-slate-600'
            return (
              <button
                key={i}
                onClick={() => navigate(`/scoring/${i}/${encodeURIComponent(shooterName)}`)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium flex-shrink-0 transition-colors ${
                  i === stageIndex ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                S{i + 1}
              </button>
            )
          })}
        </div>

        {/* Shooter navigation */}
        <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
          <button
            onClick={handlePrevShooter}
            disabled={shooters.length <= 1}
            className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="flex-1 text-center">
            <div className={`font-bold text-base ${isDQ ? 'line-through text-slate-500' : 'text-slate-100'}`}>
              {shooterName}
            </div>
            <div className="text-xs text-slate-500">
              {currentShooterIndex + 1} of {shooters.length}
            </div>
          </div>
          <button
            onClick={handleNextShooter}
            disabled={shooters.length <= 1}
            className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {isDQ && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 text-center">
            <span className="text-red-400 font-semibold">DISQUALIFIED</span>
            <span className="text-red-400/70 text-sm ml-2">{disqualifications[shooterName]}</span>
          </div>
        )}

        {/* Stage description */}
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowDesc(!showDesc)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="text-left">
              <div className="font-semibold text-slate-200 text-sm">{stageDesc.title}</div>
              <div className="text-xs text-slate-500">{stageDesc.distance} · {stageDesc.timeLimit}</div>
            </div>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${showDesc ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          {showDesc && (
            <div className="px-4 pb-4 space-y-1 text-sm text-slate-400 border-t border-slate-700 pt-3">
              <p>{stageDesc.description}</p>
              <p className="text-xs text-slate-500 mt-1">{stageDesc.ammo}</p>
            </div>
          )}
        </div>

        {/* Hit counters */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-200">Hits</h3>
            <div className="flex gap-3 text-xs text-slate-500">
              <span>T1: {targetTotals[0]}/{shotCounts[0]}</span>
              <span>T2: {targetTotals[1]}/{shotCounts[1]}</span>
            </div>
          </div>
          <div className="divide-y divide-slate-700">
            {HIT_TYPES.map((hitType, hi) => (
              <HitRow
                key={hitType}
                hitType={hitType}
                points={HIT_POINTS[hitType]}
                maxTarget1={shotCounts[0]}
                maxTarget2={shotCounts[1]}
                valueTarget1={shooterScores[hi]?.[0] ?? 0}
                valueTarget2={shooterScores[hi]?.[1] ?? 0}
                onChangeTarget1={(v) => setScore(shooterName, stageIndex, hi, 0, v)}
                onChangeTarget2={(v) => setScore(shooterName, stageIndex, hi, 1, v)}
                disabled={isDQ}
              />
            ))}
          </div>
        </div>

        {/* Time inputs */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-slate-200 mb-3">
            {timeCount === 1 ? 'Time' : `Times (${timeCount} series)`}
          </h3>
          <div className="flex gap-2">
            {Array.from({ length: timeCount }, (_, i) => (
              <div key={i} className="flex-1">
                {timeCount > 1 && (
                  <label className="text-xs text-slate-500 block mb-1">Series {i + 1}</label>
                )}
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={timeInputs[i] ?? ''}
                  onChange={(e) => handleTimeInputChange(i, e.target.value)}
                  onBlur={() => handleTimeInputBlur(i)}
                  disabled={isDQ}
                  className="w-full bg-slate-700 rounded-lg px-3 py-3 text-center font-mono text-slate-100 border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50 text-lg"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Enter as seconds (e.g. "10.28" or "1028")</p>
        </div>

        {/* Score Summary */}
        <div className={`rounded-xl p-4 ${
          status === 'complete'
            ? 'bg-green-900/20 border border-green-800/50'
            : status === 'partial'
            ? 'bg-yellow-900/20 border border-yellow-800/50'
            : 'bg-slate-800'
        }`}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-100">{totalPoints}</div>
              <div className="text-xs text-slate-400">Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{formatTime(totalTime)}</div>
              <div className="text-xs text-slate-400">Time</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${hf >= 1.3 ? 'text-green-400' : hf > 0 ? 'text-yellow-400' : 'text-slate-400'}`}>
                {totalTime > 0 ? formatHF(hf) : '—'}
              </div>
              <div className="text-xs text-slate-400">Hit Factor</div>
            </div>
          </div>
          {status === 'complete' && (
            <div className="mt-2 text-center text-sm text-green-400 font-medium">Stage complete</div>
          )}
        </div>

        {/* DQ Button */}
        {!isDQ && (
          <div>
            {showDQ ? (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-red-400">Disqualify {shooterName}</h3>
                <input
                  type="text"
                  placeholder="Reason for DQ..."
                  value={dqInput}
                  onChange={(e) => setDqInput(e.target.value)}
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-slate-100 border border-red-800 focus:border-red-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowDQ(false); setDqInput('') }}
                    className="flex-1 py-2 rounded-lg bg-slate-700 text-slate-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDQ}
                    disabled={!dqInput.trim()}
                    className="flex-1 py-2 rounded-lg bg-red-700 text-white font-medium disabled:opacity-50"
                  >
                    Confirm DQ
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDQ(true)}
                className="w-full py-3 rounded-xl border border-red-900/50 text-red-400 text-sm font-medium hover:bg-red-900/20 transition-colors"
              >
                Disqualify Shooter
              </button>
            )}
          </div>
        )}

        {/* Next button */}
        <button
          onClick={handleNextShooter}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-base transition-colors"
        >
          {currentShooterIndex === shooters.length - 1
            ? stageIndex < 4
              ? `Next Stage (Stage ${stageIndex + 2})`
              : 'Finish'
            : `Next Shooter (${shooters[nextShooterIndex]})`}
        </button>
      </div>
    </Layout>
  )
}

