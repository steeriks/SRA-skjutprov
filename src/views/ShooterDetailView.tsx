import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import StageStatusDots from '../components/StageStatusDots'
import { useStore } from '../store/useStore'
import {
  getStageStatus,
  calcStagePoints,
  calcStageTime,
  calcHitFactor,
  calcTotalHitFactor,
  hasPassed,
  formatTime,
  formatHF,
} from '../lib/sra'
import { buildShareData, buildShareUrl } from '../lib/share'
import { generatePDF } from '../lib/pdf'
import { HIT_TYPES, SHOT_COUNTS, TIME_COUNTS, STAGE_SHORT_NAMES, WeaponType } from '../types'

export default function ShooterDetailView() {
  const { name: nameParam } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const shooterName = decodeURIComponent(nameParam ?? '')

  const {
    scores,
    times,
    disqualifications,
    stage5Type,
    birthDates,
    courseNumbers,
    clubs,
    eventDate,
    eventLocation,
    judgeName,
    judgeId,
    judgePhone,
    shooters,
    setBirthDate,
    setCourseNumber,
    setClub,
    setStage5Type,
    setDisqualification,
    clearDisqualification,
  } = useStore()

  const [dqInput, setDqInput] = useState('')
  const [showDQ, setShowDQ] = useState(false)
  const [generating, setGenerating] = useState(false)

  const weaponType: WeaponType = stage5Type[shooterName] ?? 'pistol'
  const isDQ = !!disqualifications[shooterName]
  const dqReason = disqualifications[shooterName]

  const statuses = Array.from({ length: 5 }, (_, i) =>
    getStageStatus(scores[shooterName]?.[i], times[shooterName]?.[i], i,
      i === 4 ? weaponType : 'pistol')
  )

  const allDone = statuses.every((s) => s === 'complete')
  const hf = allDone ? calcTotalHitFactor(scores[shooterName], times[shooterName], weaponType) : null
  const passed = allDone ? hasPassed(scores[shooterName], times[shooterName], weaponType, isDQ) : null

  const handleResultCard = () => {
    navigate(`/result/${encodeURIComponent(shooterName)}`)
  }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      const pdfBytes = await generatePDF({
        shooterName,
        birthDate: birthDates[shooterName] ?? '',
        courseNumber: courseNumbers[shooterName] ?? '',
        club: clubs[shooterName] ?? '',
        eventDate,
        eventLocation,
        judgeName,
        judgeId,
        judgePhone,
        weaponType,
        scores: scores[shooterName],
        times: times[shooterName],
        dqReason,
      })
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SRA_${shooterName.replace(/\s+/g, '_')}_${eventDate}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed', err)
      alert('PDF-generering misslyckades. Försök igen.')
    } finally {
      setGenerating(false)
    }
  }

  const handleShare = async () => {
    const shareData = buildShareData(
      shooterName,
      scores[shooterName],
      times[shooterName],
      weaponType,
      dqReason,
      eventDate,
      eventLocation,
      judgeName,
      judgeId,
    )
    const url = buildShareUrl(shareData)
    if (navigator.share) {
      try {
        await navigator.share({ title: `SRA Resultat: ${shooterName}`, url })
        return
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url)
    alert('Resultatlänk kopierad till urklipp!')
  }

  return (
    <Layout title={shooterName} backTo="/">
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* Status */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-100">{shooterName}</h2>
              {isDQ && (
                <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">
                  DK: {dqReason}
                </span>
              )}
            </div>
            {hf !== null && (
              <div className="text-right">
                <div className={`text-2xl font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                  {formatHF(hf)}
                </div>
                <div className={`text-xs font-semibold ${passed ? 'text-green-500' : 'text-red-500'}`}>
                  {passed ? 'GODKÄND' : 'UNDERKÄND'}
                </div>
              </div>
            )}
          </div>
          <StageStatusDots statuses={statuses} />
        </div>

        {/* Skyttardetaljer */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wide">Skyttardetaljer</h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Födelsedatum</label>
            <input
              type="date"
              value={birthDates[shooterName] ?? ''}
              onChange={(e) => setBirthDate(shooterName, e.target.value)}
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-slate-100 border border-slate-600 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Kursnummer</label>
            <input
              type="text"
              value={courseNumbers[shooterName] ?? ''}
              onChange={(e) => setCourseNumber(shooterName, e.target.value)}
              placeholder="t.ex. SRA-2024-001"
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-slate-100 border border-slate-600 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Förening / Enhet</label>
            <input
              type="text"
              value={clubs[shooterName] ?? ''}
              onChange={(e) => setClub(shooterName, e.target.value)}
              placeholder="Förenings- eller enhetsnamn..."
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-slate-100 border border-slate-600 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-2">Moment 5 – Vapen</label>
            <div className="flex gap-2">
              {(['pistol', 'rifle'] as WeaponType[]).map((wt) => (
                <button
                  key={wt}
                  onClick={() => setStage5Type(shooterName, wt)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    weaponType === wt
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {wt === 'pistol' ? 'Pistol' : 'Gevär'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Momentsammanfattning */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wide mb-3">Momentsammanfattning</h3>
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, si) => {
              const wt: WeaponType = si === 4 ? weaponType : 'pistol'
              const stageScores = scores[shooterName]?.[si] ?? []
              const stageTimes = times[shooterName]?.[si] ?? []
              const pts = calcStagePoints(stageScores)
              const time = calcStageTime(stageTimes)
              const stageHF = calcHitFactor(pts, time)
              const status = statuses[si]

              return (
                <Link
                  key={si}
                  to={`/scoring/${si}/${encodeURIComponent(shooterName)}`}
                  className="flex items-center gap-3 py-2 border-b border-slate-700 last:border-0"
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    status === 'complete' ? 'bg-green-500' : status === 'partial' ? 'bg-yellow-500' : 'bg-slate-600'
                  }`} />
                  <span className="text-sm text-slate-300 flex-1">{STAGE_SHORT_NAMES[si]}</span>
                  {status !== 'pending' && (
                    <>
                      <span className="text-sm font-mono text-slate-400">{pts} p</span>
                      <span className="text-sm font-mono text-slate-400">{formatTime(time)}s</span>
                      <span className={`text-sm font-mono font-bold ${stageHF >= 1.3 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {formatHF(stageHF)}
                      </span>
                    </>
                  )}
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Åtgärder */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleResultCard}
            className="py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium text-sm transition-colors"
          >
            Resultatkort
          </button>
          <button
            onClick={handleShare}
            className="py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium text-sm transition-colors"
          >
            Dela länk
          </button>
        </div>

        <button
          onClick={handleGeneratePDF}
          disabled={generating}
          className="w-full py-3 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
        >
          {generating ? 'Genererar PDF...' : 'Ladda ner PDF'}
        </button>

        {/* DK-sektion */}
        {isDQ ? (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-red-400 font-semibold">Diskvalificerad</div>
                <div className="text-red-400/70 text-sm">{dqReason}</div>
              </div>
              <button
                onClick={() => clearDisqualification(shooterName)}
                className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm"
              >
                Återinför
              </button>
            </div>
          </div>
        ) : (
          <div>
            {showDQ ? (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-red-400">Diskvalificera skytt</h3>
                <input
                  type="text"
                  placeholder="Anledning till DK..."
                  value={dqInput}
                  onChange={(e) => setDqInput(e.target.value)}
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-slate-100 border border-red-800 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowDQ(false); setDqInput('') }}
                    className="flex-1 py-2 rounded-lg bg-slate-700 text-slate-300"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={() => { setDisqualification(shooterName, dqInput); setShowDQ(false); setDqInput('') }}
                    disabled={!dqInput.trim()}
                    className="flex-1 py-2 rounded-lg bg-red-700 text-white disabled:opacity-50"
                  >
                    Bekräfta DK
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDQ(true)}
                className="w-full py-3 rounded-xl border border-red-900/50 text-red-400 text-sm font-medium"
              >
                Diskvalificera skytt
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
