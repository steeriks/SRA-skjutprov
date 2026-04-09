import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WeaponType, SHOT_COUNTS, HIT_TYPES } from '../types'

export interface AppState {
  shooters: string[]
  scores: Record<string, number[][][]>   // scores[shooter][stage][hitType][target]
  times: Record<string, number[][]>       // times[shooter][stage][timeIndex]
  disqualifications: Record<string, string>
  stage5Type: Record<string, WeaponType>
  birthDates: Record<string, string>
  courseNumbers: Record<string, string>
  clubs: Record<string, string>
  shooterOrder: 'rotating' | 'fixed'
  eventLocation: string
  eventDate: string
  judgeName: string
  judgeId: string
  judgePhone: string
  safetyConfirmed: boolean
  muted: boolean
  editMode: boolean

  // Actions
  addShooter: (name: string) => void
  removeShooter: (name: string) => void
  setScore: (shooter: string, stage: number, hitType: number, target: number, value: number) => void
  setTime: (shooter: string, stage: number, timeIndex: number, value: number) => void
  setDisqualification: (shooter: string, reason: string) => void
  clearDisqualification: (shooter: string) => void
  setStage5Type: (shooter: string, type: WeaponType) => void
  setBirthDate: (shooter: string, date: string) => void
  setCourseNumber: (shooter: string, num: string) => void
  setClub: (shooter: string, club: string) => void
  setShooterOrder: (order: 'rotating' | 'fixed') => void
  setEventLocation: (loc: string) => void
  setEventDate: (date: string) => void
  setJudgeName: (name: string) => void
  setJudgeId: (id: string) => void
  setJudgePhone: (phone: string) => void
  setSafetyConfirmed: (v: boolean) => void
  setMuted: (v: boolean) => void
  setEditMode: (v: boolean) => void
  rotateShooters: () => void
  resetEvent: () => void
  getShooterScores: (shooter: string) => number[][][]
  getShooterTimes: (shooter: string) => number[][]
  getWeaponType: (shooter: string, stage: number) => WeaponType
}

function emptyScores(): number[][][] {
  // 5 stages, 5 hit types, 2 targets
  return Array.from({ length: 5 }, () =>
    Array.from({ length: HIT_TYPES.length }, () => [0, 0])
  )
}

function emptyTimes(): number[][] {
  // 5 stages, variable times per stage
  return [[0, 0, 0], [0, 0, 0], [0], [0], [0]]
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      shooters: [],
      scores: {},
      times: {},
      disqualifications: {},
      stage5Type: {},
      birthDates: {},
      courseNumbers: {},
      clubs: {},
      shooterOrder: 'rotating',
      eventLocation: '',
      eventDate: new Date().toISOString().split('T')[0],
      judgeName: '',
      judgeId: '',
      judgePhone: '',
      safetyConfirmed: false,
      muted: false,
      editMode: false,

      addShooter: (name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        set((state) => {
          if (state.shooters.includes(trimmed)) return state
          return {
            shooters: [...state.shooters, trimmed],
            scores: { ...state.scores, [trimmed]: emptyScores() },
            times: { ...state.times, [trimmed]: emptyTimes() },
            stage5Type: { ...state.stage5Type, [trimmed]: 'pistol' as WeaponType },
          }
        })
      },

      removeShooter: (name) => {
        set((state) => {
          const shooters = state.shooters.filter((s) => s !== name)
          const scores = { ...state.scores }
          const times = { ...state.times }
          const dq = { ...state.disqualifications }
          const s5 = { ...state.stage5Type }
          const bd = { ...state.birthDates }
          const cn = { ...state.courseNumbers }
          const cl = { ...state.clubs }
          delete scores[name]
          delete times[name]
          delete dq[name]
          delete s5[name]
          delete bd[name]
          delete cn[name]
          delete cl[name]
          return { shooters, scores, times, disqualifications: dq, stage5Type: s5, birthDates: bd, courseNumbers: cn, clubs: cl }
        })
      },

      setScore: (shooter, stage, hitType, target, value) => {
        set((state) => {
          const shooterScores = state.scores[shooter] ?? emptyScores()
          const newScores = shooterScores.map((stageArr, si) =>
            si === stage
              ? stageArr.map((htArr, hi) =>
                  hi === hitType
                    ? htArr.map((v, ti) => (ti === target ? Math.max(0, value) : v))
                    : htArr
                )
              : stageArr
          )
          return {
            scores: { ...state.scores, [shooter]: newScores },
          }
        })
      },

      setTime: (shooter, stage, timeIndex, value) => {
        set((state) => {
          const shooterTimes = state.times[shooter] ?? emptyTimes()
          const newTimes = shooterTimes.map((stageArr, si) =>
            si === stage
              ? stageArr.map((v, ti) => (ti === timeIndex ? value : v))
              : stageArr
          )
          return {
            times: { ...state.times, [shooter]: newTimes },
          }
        })
      },

      setDisqualification: (shooter, reason) => {
        set((state) => ({
          disqualifications: { ...state.disqualifications, [shooter]: reason },
        }))
      },

      clearDisqualification: (shooter) => {
        set((state) => {
          const dq = { ...state.disqualifications }
          delete dq[shooter]
          return { disqualifications: dq }
        })
      },

      setStage5Type: (shooter, type) => {
        set((state) => ({
          stage5Type: { ...state.stage5Type, [shooter]: type },
        }))
      },

      setBirthDate: (shooter, date) => {
        set((state) => ({ birthDates: { ...state.birthDates, [shooter]: date } }))
      },

      setCourseNumber: (shooter, num) => {
        set((state) => ({ courseNumbers: { ...state.courseNumbers, [shooter]: num } }))
      },

      setClub: (shooter, club) => {
        set((state) => ({ clubs: { ...state.clubs, [shooter]: club } }))
      },

      setShooterOrder: (order) => set({ shooterOrder: order }),
      setEventLocation: (loc) => set({ eventLocation: loc }),
      setEventDate: (date) => set({ eventDate: date }),
      setJudgeName: (name) => set({ judgeName: name }),
      setJudgeId: (id) => set({ judgeId: id }),
      setJudgePhone: (phone) => set({ judgePhone: phone }),
      setSafetyConfirmed: (v) => set({ safetyConfirmed: v }),
      setMuted: (v) => set({ muted: v }),
      setEditMode: (v) => set({ editMode: v }),

      rotateShooters: () => {
        set((state) => {
          if (state.shooters.length === 0) return state
          const [first, ...rest] = state.shooters
          return { shooters: [...rest, first] }
        })
      },

      resetEvent: () => {
        set({
          shooters: [],
          scores: {},
          times: {},
          disqualifications: {},
          stage5Type: {},
          birthDates: {},
          courseNumbers: {},
          clubs: {},
          safetyConfirmed: false,
          eventLocation: '',
          eventDate: new Date().toISOString().split('T')[0],
        })
      },

      getShooterScores: (shooter) => {
        return get().scores[shooter] ?? emptyScores()
      },

      getShooterTimes: (shooter) => {
        return get().times[shooter] ?? emptyTimes()
      },

      getWeaponType: (shooter, stage) => {
        if (stage === 4) {
          return get().stage5Type[shooter] ?? 'pistol'
        }
        return 'pistol' // stages 1-4 use pistol shot counts by default (rifle same for 1-4)
      },
    }),
    {
      name: 'sra-shooting-test-v1',
    }
  )
)
