import pako from 'pako'
import { calcStagePoints, calcStageTime, calcHitFactor } from './sra'
import { HIT_TYPES, SHOT_COUNTS, WeaponType } from '../types'

export interface ShareData {
  n: string          // name
  dl: string         // date + location
  r: number[][]      // [A,C,D,M,P] per stage
  a: number[]        // total time per stage
  h: string | null   // dq reason
  tn: string         // judge name
  tno: string        // judge id
}

/**
 * Encode share data to URL-safe base64
 */
export function encodeShareData(data: ShareData): string {
  const json = JSON.stringify(data)
  const compressed = pako.deflate(json)
  // Convert to base64
  let binary = ''
  compressed.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  const b64 = btoa(binary)
  // Make URL-safe
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Decode share data from URL-safe base64
 */
export function decodeShareData(encoded: string): ShareData | null {
  try {
    // Restore base64
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding
    while (b64.length % 4) b64 += '='
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decompressed = pako.inflate(bytes, { to: 'string' })
    return JSON.parse(decompressed) as ShareData
  } catch {
    return null
  }
}

/**
 * Build share data for a shooter
 */
export function buildShareData(
  name: string,
  scores: number[][][] | undefined,
  times: number[][] | undefined,
  weaponType: WeaponType,
  dqReason: string | undefined,
  eventDate: string,
  eventLocation: string,
  judgeName: string,
  judgeId: string,
): ShareData {
  const r: number[][] = []
  const a: number[] = []

  for (let s = 0; s < 5; s++) {
    const stageScores = scores?.[s] ?? []
    const stageTimes = times?.[s] ?? []

    // Count per hit type
    const counts: number[] = []
    for (let h = 0; h < HIT_TYPES.length; h++) {
      let count = 0
      const maxTargets = SHOT_COUNTS[weaponType][s].length
      for (let t = 0; t < maxTargets; t++) {
        count += stageScores[h]?.[t] ?? 0
      }
      counts.push(count)
    }
    r.push(counts)
    a.push(calcStageTime(stageTimes))
  }

  return {
    n: name,
    dl: `${eventDate} ${eventLocation}`.trim(),
    r,
    a,
    h: dqReason ?? null,
    tn: judgeName,
    tno: judgeId,
  }
}

/**
 * Build share URL
 */
export function buildShareUrl(data: ShareData): string {
  const encoded = encodeShareData(data)
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '')
  return `${base}/result?data=${encoded}`
}

/**
 * Stage total points from share data
 */
export function stageTotalPoints(stageR: number[]): number {
  const pts = [5, 3, 1, -10, -10]
  return stageR.reduce((sum, count, i) => sum + count * pts[i], 0)
}

/**
 * Total hit factor from share data
 */
export function totalHFFromShare(data: ShareData): number {
  let totalPts = 0
  let totalTime = 0
  for (let s = 0; s < 5; s++) {
    totalPts += stageTotalPoints(data.r[s] ?? [0,0,0,0,0])
    totalTime += data.a[s] ?? 0
  }
  return calcHitFactor(totalPts, totalTime)
}
