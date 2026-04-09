import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { useStore } from '../store/useStore'
import {
  calcHitFactor,
  formatTime,
  formatHF,
} from '../lib/sra'
import {
  buildShareData,
  buildShareUrl,
  decodeShareData,
  stageTotalPoints,
  totalHFFromShare,
  ShareData,
} from '../lib/share'
import { STAGE_SHORT_NAMES, PASS_THRESHOLD, WeaponType } from '../types'
import QRCode from 'qrcode'

export default function ResultCardView() {
  const { name: nameParam } = useParams<{ name: string }>()
  const [searchParams] = useSearchParams()
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const [shareUrl, setShareUrl] = useState('')

  const {
    scores,
    times,
    disqualifications,
    stage5Type,
    eventDate,
    eventLocation,
    judgeName,
    judgeId,
  } = useStore()

  // Determine data source: URL param or store
  const encodedData = searchParams.get('data')
  const shooterName = decodeURIComponent(nameParam ?? '')

  const shareData: ShareData | null = useMemo(() => {
    if (encodedData) {
      return decodeShareData(encodedData)
    }
    if (!shooterName) return null
    const weaponType: WeaponType = stage5Type[shooterName] ?? 'pistol'
    return buildShareData(
      shooterName,
      scores[shooterName],
      times[shooterName],
      weaponType,
      disqualifications[shooterName],
      eventDate,
      eventLocation,
      judgeName,
      judgeId,
    )
  }, [encodedData, shooterName])

  const displayName = shareData?.n ?? shooterName ?? 'Unknown'

  useEffect(() => {
    if (!shareData) return
    const url = buildShareUrl(shareData)
    setShareUrl(url)

    const canvas = qrCanvasRef.current
    if (canvas) {
      QRCode.toCanvas(canvas, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#f8fafc',
        },
      }).catch(console.error)
    }
  }, [shareData])

  if (!shareData) {
    return (
      <Layout title="Result Card" backTo="/">
        <div className="p-4 text-center text-slate-400">Invalid result data.</div>
      </Layout>
    )
  }

  const isDQ = !!shareData.h
  const totalHF = totalHFFromShare(shareData)
  const passed = !isDQ && totalHF >= PASS_THRESHOLD

  const hitTypeLabels = ['A', 'C', 'D', 'M', 'P']

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `SRA Result: ${displayName}`, url: shareUrl })
        return
      } catch {
        // fall through
      }
    }
    await navigator.clipboard.writeText(shareUrl)
    alert('Link copied to clipboard!')
  }

  return (
    <Layout title="Result Card" backTo={nameParam ? `/shooter/${encodeURIComponent(displayName)}` : '/'}>
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* Header */}
        <div className={`rounded-xl p-5 text-center ${passed ? 'bg-green-900/30 border border-green-700/50' : isDQ ? 'bg-red-900/30 border border-red-700/50' : 'bg-red-900/20 border border-red-800/50'}`}>
          <div className="text-sm text-slate-400 mb-1 font-medium">SRA SHOOTING TEST</div>
          <div className="text-2xl font-bold text-slate-100 mb-1">{displayName}</div>
          <div className="text-sm text-slate-400 mb-4">{shareData.dl}</div>

          {isDQ ? (
            <div>
              <div className="text-4xl font-black text-red-400">DQ</div>
              <div className="text-sm text-red-400/70 mt-1">{shareData.h}</div>
            </div>
          ) : (
            <div>
              <div className={`text-5xl font-black ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {formatHF(totalHF)}
              </div>
              <div className="text-sm text-slate-400 mt-1">Hit Factor</div>
              <div className={`text-xl font-bold mt-2 ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {passed ? 'PASSED' : 'FAILED'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Threshold: {PASS_THRESHOLD.toFixed(1)}</div>
            </div>
          )}
        </div>

        {/* Stage breakdown */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wide mb-3">Stage Results</h3>

          {/* Header row */}
          <div className="grid grid-cols-8 gap-1 text-xs text-slate-500 mb-2 px-1">
            <div className="col-span-2">Stage</div>
            <div className="text-center text-green-400">A</div>
            <div className="text-center text-blue-400">C</div>
            <div className="text-center text-yellow-400">D</div>
            <div className="text-center text-red-400">M</div>
            <div className="text-center">Time</div>
            <div className="text-center">HF</div>
          </div>

          {shareData.r.map((stageHits, si) => {
            const stagePts = stageTotalPoints(stageHits)
            const stageTime = shareData.a[si] ?? 0
            const stageHF = calcHitFactor(stagePts, stageTime)

            return (
              <div
                key={si}
                className={`grid grid-cols-8 gap-1 text-sm py-2 border-t border-slate-700 px-1 ${si % 2 === 1 ? 'bg-slate-700/30 rounded' : ''}`}
              >
                <div className="col-span-2 text-slate-300 font-medium text-xs">
                  {STAGE_SHORT_NAMES[si]}
                </div>
                {stageHits.slice(0, 4).map((count, hi) => (
                  <div key={hi} className="text-center font-mono text-slate-300 text-xs">{count}</div>
                ))}
                <div className="text-center font-mono text-slate-400 text-xs">
                  {stageTime > 0 ? formatTime(stageTime) : '—'}
                </div>
                <div
                  className={`text-center font-mono font-bold text-xs ${
                    stageHF >= 1.3 ? 'text-green-400' : stageTime > 0 ? 'text-yellow-400' : 'text-slate-500'
                  }`}
                >
                  {stageTime > 0 ? formatHF(stageHF) : '—'}
                </div>
              </div>
            )
          })}

          {/* Total row */}
          <div className="grid grid-cols-8 gap-1 text-sm py-2 border-t-2 border-slate-600 px-1 mt-1">
            <div className="col-span-2 font-bold text-slate-200 text-xs">TOTAL</div>
            {hitTypeLabels.slice(0, 4).map((_, hi) => {
              const total = shareData.r.reduce((sum, sr) => sum + (sr[hi] ?? 0), 0)
              return (
                <div key={hi} className="text-center font-mono text-slate-300 text-xs font-bold">
                  {total}
                </div>
              )
            })}
            <div className="text-center font-mono text-slate-300 text-xs font-bold">
              {formatTime(shareData.a.reduce((a, b) => a + b, 0))}
            </div>
            <div className={`text-center font-mono font-bold text-xs ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {formatHF(totalHF)}
            </div>
          </div>
        </div>

        {/* Judge info */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Judge</div>
              <div className="text-slate-200">{shareData.tn || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Judge ID</div>
              <div className="text-slate-200">{shareData.tno || '—'}</div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-slate-800 rounded-xl p-4 flex flex-col items-center gap-3">
          <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wide self-start">Share Result</h3>
          <div className="bg-slate-100 p-3 rounded-xl">
            <canvas ref={qrCanvasRef} />
          </div>
          <p className="text-xs text-slate-500 text-center">Scan to view result on any device</p>
          <button
            onClick={handleShare}
            className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Share / Copy Link
          </button>
        </div>
      </div>
    </Layout>
  )
}
