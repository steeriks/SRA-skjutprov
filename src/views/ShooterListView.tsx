import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import StageStatusDots from '../components/StageStatusDots'
import { useStore } from '../store/useStore'
import {
  getStageStatus,
  calcTotalHitFactor,
  hasPassed,
  formatHF,
} from '../lib/sra'
import { StageStatus } from '../types'

export default function ShooterListView() {
  const navigate = useNavigate()
  const [newName, setNewName] = useState('')
  const [showEventForm, setShowEventForm] = useState(false)

  const {
    shooters,
    scores,
    times,
    disqualifications,
    stage5Type,
    eventLocation,
    eventDate,
    judgeName,
    judgeId,
    judgePhone,
    safetyConfirmed,
    shooterOrder,
    editMode,
    addShooter,
    removeShooter,
    setEventLocation,
    setEventDate,
    setJudgeName,
    setJudgeId,
    setJudgePhone,
    setSafetyConfirmed,
    setShooterOrder,
    setEditMode,
    resetEvent,
  } = useStore()

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    addShooter(name)
    setNewName('')
  }

  const handleStart = () => {
    if (!safetyConfirmed) {
      navigate('/safety')
    } else {
      navigate(`/scoring/0/${encodeURIComponent(shooters[0])}`)
    }
  }

  const getShooterStageStatuses = (name: string): StageStatus[] => {
    const weaponType = stage5Type[name] ?? 'pistol'
    return Array.from({ length: 5 }, (_, i) =>
      getStageStatus(scores[name]?.[i], times[name]?.[i], i, weaponType)
    )
  }

  const allStagesComplete = (name: string): boolean => {
    return getShooterStageStatuses(name).every((s) => s === 'complete')
  }

  return (
    <Layout>
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* Provinfo */}
        <div
          className="bg-slate-800 rounded-xl p-4 cursor-pointer"
          onClick={() => setShowEventForm(!showEventForm)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Prov</h2>
              <p className="text-slate-100 font-medium mt-0.5">
                {eventLocation || 'Ingen plats angiven'} &mdash; {eventDate || 'Inget datum angett'}
              </p>
              {judgeName && <p className="text-slate-400 text-sm">Domare: {judgeName}</p>}
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${showEventForm ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        {showEventForm && (
          <div className="bg-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-slate-200">Provdetaljer</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Datum</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 border border-slate-600 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Plats</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Skjutbanans namn..."
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 border border-slate-600 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Domarens namn</label>
                <input
                  type="text"
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  placeholder="Fullständigt namn..."
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 border border-slate-600 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Domar-ID</label>
                <input
                  type="text"
                  value={judgeId}
                  onChange={(e) => setJudgeId(e.target.value)}
                  placeholder="ID-nummer..."
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 border border-slate-600 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Domarens telefon</label>
                <input
                  type="tel"
                  value={judgePhone}
                  onChange={(e) => setJudgePhone(e.target.value)}
                  placeholder="Telefonnummer..."
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 border border-slate-600 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">Skyttarordning:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShooterOrder('rotating')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    shooterOrder === 'rotating'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Roterande
                </button>
                <button
                  onClick={() => setShooterOrder('fixed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    shooterOrder === 'fixed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Fast
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm('Återställ all provdata? Detta kan inte ångras.')) {
                  resetEvent()
                  setShowEventForm(false)
                }
              }}
              className="w-full py-2 rounded-lg bg-red-900/50 text-red-400 border border-red-800 text-sm font-medium"
            >
              Återställ prov
            </button>
          </div>
        )}

        {/* Säkerhetsgenomgång */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSafetyConfirmed(!safetyConfirmed)}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                safetyConfirmed
                  ? 'bg-green-600 border-green-600'
                  : 'border-slate-500'
              }`}
            >
              {safetyConfirmed && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </button>
            <div className="flex-1">
              <span className="text-sm text-slate-200">Säkerhetsgenomgång genomförd</span>
            </div>
            <Link
              to="/safety"
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Visa regler
            </Link>
          </div>
        </div>

        {/* Lägg till skytt */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Skyttar ({shooters.length})
          </h2>
          <div className="flex gap-2 mb-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Förnamn Efternamn..."
              className="flex-1 bg-slate-700 rounded-lg px-3 py-2.5 text-slate-100 border border-slate-600 focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition-colors"
            >
              Lägg till
            </button>
          </div>
        </div>

        {/* Skyttarlista */}
        {shooters.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Skyttarlista</span>
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {editMode ? 'Klar' : 'Redigera'}
              </button>
            </div>
            {shooters.map((name, index) => {
              const weaponType = stage5Type[name] ?? 'pistol'
              const statuses = getShooterStageStatuses(name)
              const isDQ = !!disqualifications[name]
              const allDone = allStagesComplete(name)
              const hf = allDone ? calcTotalHitFactor(scores[name], times[name], weaponType) : null
              const passed = allDone ? hasPassed(scores[name], times[name], weaponType, isDQ) : null

              return (
                <div
                  key={name}
                  className="bg-slate-800 rounded-xl flex items-center gap-3 px-4 py-3"
                >
                  {editMode && (
                    <button
                      onClick={() => {
                        if (confirm(`Ta bort ${name}?`)) removeShooter(name)
                      }}
                      className="w-7 h-7 rounded-full bg-red-900/60 text-red-400 flex items-center justify-center flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                  <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-200">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${isDQ ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {name}
                      </span>
                      {isDQ && <span className="text-xs bg-red-900/50 text-red-400 px-1.5 rounded">DK</span>}
                    </div>
                    <StageStatusDots statuses={statuses} />
                  </div>
                  <div className="flex items-center gap-2">
                    {hf !== null && (
                      <div className="text-right">
                        <div className={`text-sm font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                          {formatHF(hf)}
                        </div>
                        <div className={`text-xs ${passed ? 'text-green-500' : 'text-red-500'}`}>
                          {passed ? 'GK' : 'UK'}
                        </div>
                      </div>
                    )}
                    <Link
                      to={`/shooter/${encodeURIComponent(name)}`}
                      className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {shooters.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p className="text-sm">Lägg till skyttar för att börja</p>
          </div>
        )}

        {shooters.length > 0 && (
          <button
            onClick={handleStart}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg"
          >
            {safetyConfirmed ? 'Starta poängräkning' : 'Säkerhetsgenomgång & Start'}
          </button>
        )}
      </div>
    </Layout>
  )
}
