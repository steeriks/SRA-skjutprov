export type HitType = 'A' | 'C' | 'D' | 'M' | 'P'
export type StageStatus = 'pending' | 'partial' | 'complete'
export type WeaponType = 'pistol' | 'rifle'

// HitType index: 0=A, 1=C, 2=D, 3=M, 4=P
export const HIT_TYPES: HitType[] = ['A', 'C', 'D', 'M', 'P']
export const HIT_POINTS: Record<HitType, number> = {
  A: 5,
  C: 3,
  D: 1,
  M: -10,
  P: -10,
}

// Shot counts: [target1, target2]
// Stage index 0-4
export const SHOT_COUNTS: Record<WeaponType, number[][]> = {
  pistol: [
    [6, 6], // Stage 1
    [6, 6], // Stage 2
    [4, 2], // Stage 3
    [6, 6], // Stage 4
    [4, 4], // Stage 5
  ],
  rifle: [
    [6, 6], // Stage 1
    [6, 6], // Stage 2
    [4, 2], // Stage 3
    [6, 6], // Stage 4
    [6, 6], // Stage 5
  ],
}

// Number of time entries per stage (stages 1-2: 3 series, stages 3-5: 1 time)
export const TIME_COUNTS = [3, 3, 1, 1, 1]

export const STAGE_NAMES = [
  'Moment 1 – Bilateral & Enstämmigt',
  'Moment 2 – Vändningar',
  'Moment 3 – Förflyttning & Magasinsbyte',
  'Moment 4 – Framåtrörelse',
  'Moment 5 – Bakåtrörelse',
]

export const STAGE_SHORT_NAMES = [
  'Bilateral',
  'Vändningar',
  'Förflyttning',
  'Framåt',
  'Bakåt',
]

export const PASS_THRESHOLD = 1.3

export interface StageResult {
  hits: number[][] // hits[hitTypeIndex][targetIndex]
  times: number[]
  totalPoints: number
  totalTime: number
  hitFactor: number
  complete: boolean
}

export interface ShooterResult {
  name: string
  stages: StageResult[]
  totalHitFactor: number
  passed: boolean
  disqualified: boolean
  dqReason?: string
}
