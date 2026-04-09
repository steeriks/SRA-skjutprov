import {
  HIT_POINTS,
  HIT_TYPES,
  SHOT_COUNTS,
  TIME_COUNTS,
  PASS_THRESHOLD,
  StageStatus,
  WeaponType,
} from '../types'

/**
 * Calculate total points for a stage
 * scores[hitTypeIndex][targetIndex]
 */
export function calcStagePoints(
  scores: number[][],
): number {
  let total = 0
  for (let h = 0; h < HIT_TYPES.length; h++) {
    const hitType = HIT_TYPES[h]
    const pts = HIT_POINTS[hitType]
    for (let t = 0; t < 2; t++) {
      total += (scores[h]?.[t] ?? 0) * pts
    }
  }
  return total
}

/**
 * Calculate total time for a stage (sum of all time entries)
 */
export function calcStageTime(times: number[]): number {
  return times.reduce((a, b) => a + b, 0)
}

/**
 * Hit factor = points / time (0 if time = 0)
 */
export function calcHitFactor(points: number, time: number): number {
  if (time <= 0) return 0
  return points / time
}

/**
 * Get stage status for a shooter
 */
export function getStageStatus(
  scores: number[][] | undefined,
  times: number[] | undefined,
  stageIndex: number,
  weaponType: WeaponType,
): StageStatus {
  if (!scores || !times) return 'pending'

  const shotCounts = SHOT_COUNTS[weaponType][stageIndex]
  const timeCount = TIME_COUNTS[stageIndex]

  // Check if any data entered
  let anyEntered = false
  let allComplete = true

  // Check hits
  for (let h = 0; h < HIT_TYPES.length; h++) {
    for (let t = 0; t < shotCounts.length; t++) {
      const val = scores[h]?.[t] ?? 0
      if (val > 0) anyEntered = true
    }
  }

  // Check that total shots per target matches
  for (let t = 0; t < shotCounts.length; t++) {
    let targetTotal = 0
    for (let h = 0; h < HIT_TYPES.length; h++) {
      targetTotal += scores[h]?.[t] ?? 0
    }
    if (targetTotal !== shotCounts[t]) {
      allComplete = false
    }
  }

  // Check times
  for (let i = 0; i < timeCount; i++) {
    const t = times[i] ?? 0
    if (t <= 0) {
      allComplete = false
    } else {
      anyEntered = true
    }
  }

  if (allComplete) return 'complete'
  if (anyEntered) return 'partial'
  return 'pending'
}

/**
 * Get total hit factor across all stages for a shooter
 * Sum all points / sum all times
 */
export function calcTotalHitFactor(
  allScores: number[][][] | undefined,
  allTimes: number[][] | undefined,
  weaponType: WeaponType,
): number {
  if (!allScores || !allTimes) return 0
  let totalPoints = 0
  let totalTime = 0

  for (let s = 0; s < 5; s++) {
    const scores = allScores[s]
    const times = allTimes[s]
    if (!scores || !times) continue

    // Only include complete stages
    const status = getStageStatus(scores, times, s, weaponType)
    if (status !== 'complete') continue

    totalPoints += calcStagePoints(scores)
    totalTime += calcStageTime(times)
  }

  return calcHitFactor(totalPoints, totalTime)
}

/**
 * Check if a shooter has passed
 */
export function hasPassed(
  allScores: number[][][] | undefined,
  allTimes: number[][] | undefined,
  weaponType: WeaponType,
  disqualified: boolean,
): boolean {
  if (disqualified) return false

  // All 5 stages must be complete
  for (let s = 0; s < 5; s++) {
    const status = getStageStatus(
      allScores?.[s],
      allTimes?.[s],
      s,
      weaponType,
    )
    if (status !== 'complete') return false
  }

  const hf = calcTotalHitFactor(allScores, allTimes, weaponType)
  return hf >= PASS_THRESHOLD
}

/**
 * Get display name - if duplicate first names, show first + last initial
 */
export function getDisplayName(name: string, allNames: string[]): string {
  const parts = name.trim().split(/\s+/)
  const firstName = parts[0]

  const duplicates = allNames.filter((n) => {
    const p = n.trim().split(/\s+/)
    return p[0].toLowerCase() === firstName.toLowerCase() && n !== name
  })

  if (duplicates.length > 0 && parts.length > 1) {
    return `${firstName} ${parts[parts.length - 1][0]}.`
  }
  return firstName
}

/**
 * Parse time input: "1028" -> 10.28, "1028.5" -> stays, "10.28" -> 10.28
 */
export function parseTimeInput(input: string): number {
  const cleaned = input.trim().replace(',', '.')

  // If already in decimal form
  if (cleaned.includes('.')) {
    const val = parseFloat(cleaned)
    return isNaN(val) ? 0 : val
  }

  // Integer input: last 2 digits are hundredths
  if (/^\d+$/.test(cleaned)) {
    const num = parseInt(cleaned, 10)
    if (cleaned.length <= 2) {
      return num / 100
    }
    const hundredths = num % 100
    const seconds = Math.floor(num / 100)
    return seconds + hundredths / 100
  }

  const val = parseFloat(cleaned)
  return isNaN(val) ? 0 : val
}

/**
 * Format time as "10.28"
 */
export function formatTime(t: number): string {
  if (t <= 0) return '—'
  return t.toFixed(2)
}

/**
 * Format hit factor
 */
export function formatHF(hf: number): string {
  return hf.toFixed(3)
}

export const STAGE_DESCRIPTIONS = [
  {
    title: 'Stage 1 - Bilateral & Single-Hand Shooting',
    distance: '10m',
    timeLimit: '5 sec per series',
    description:
      '2 shots per target per series. Series 1: both hands. Series 2: strong hand only. Series 3: weak hand only.',
    ammo: 'Pistol: 6 shots/target (12 total) | Rifle: 6 shots/target (12 total)',
  },
  {
    title: 'Stage 2 - Turns',
    distance: '10m',
    timeLimit: '5 sec per series',
    description:
      'Start back/side to targets. Series 1: 180° turn, 2 shots/target. Series 2: 90° turn left, 2 shots/target. Series 3: 90° turn right, 2 shots/target.',
    ammo: 'Pistol: 6 shots/target (12 total) | Rifle: 6 shots/target (12 total)',
  },
  {
    title: 'Stage 3 - Movement & Magazine Change',
    distance: '10m',
    timeLimit: '15 sec',
    description:
      'Start: back to targets, hands up. Turn 180°, 2 shots at pos A/B, move forward (mag change), 2 shots, move back (mag change), 2 shots.',
    ammo: 'Pistol: 4+2 shots/target | Rifle: 4+2 shots/target',
  },
  {
    title: 'Stage 4 - Forward Movement & Magazine Change',
    distance: '20m → 15m → 10m',
    timeLimit: '25 sec',
    description:
      'Standing at 20m: 2 shots/target. Move to 15m, kneel: 2 shots/target. Move to 10m, prone/kneel: 2 shots/target.',
    ammo: 'Pistol: 6 shots/target (12 total) | Rifle: 6 shots/target (12 total)',
  },
  {
    title: 'Stage 5 - Backward Movement',
    distance: 'Pistol: 10m→15m | Rifle: 20m (A→B→C)',
    timeLimit: '15 sec',
    description:
      'PISTOL: Start at 10m, 4 shots/target. Move back to 15m, 4 shots/target.\nRIFLE: At 20m, pos A: 6 shots/target, pos B: 6 shots/target, pos C: 6 shots/target.',
    ammo: 'Pistol: 4+4 shots/target | Rifle: 6+6 shots/target',
  },
]
