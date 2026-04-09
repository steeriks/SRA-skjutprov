import React, { useState } from 'react'
import Layout from '../components/Layout'

const RULES_SECTIONS = [
  {
    title: 'General Rules',
    content: [
      'The SRA shooting test (skjutprov) evaluates practical shooting skills for applied reserve military shooting.',
      'The test consists of 5 stages, each testing different aspects of combat shooting.',
      'A minimum Hit Factor of 1.3 is required to pass the overall test.',
      'Disqualification (DQ) results in automatic failure of the entire test.',
      'The judge\'s decision is final in all matters of rule interpretation.',
    ],
  },
  {
    title: 'Scoring System',
    content: [
      'Alpha (A): 5 points — Best zone, center of target',
      'Charlie (C): 3 points — Good zone, acceptable hit',
      'Delta (D): 1 point — Marginal zone, peripheral hit',
      'Miss (M): −10 points — No hit on target',
      'Procedural (P): −10 points — Rule violation penalty',
      'Hit Factor (HF) = Total Points ÷ Total Time',
      'Only stages where all required shots are registered count toward the final HF.',
    ],
  },
  {
    title: 'Stage 1 — Bilateral & Single-Hand Shooting',
    content: [
      'Distance: 10 meters',
      'Time limit: 5 seconds per series',
      'Series 1: Both hands — 2 shots per target',
      'Series 2: Strong hand only — 2 shots per target',
      'Series 3: Weak hand only — 2 shots per target',
      'Total: 6 shots per target, 12 rounds total',
      'Applies to both pistol and rifle.',
    ],
  },
  {
    title: 'Stage 2 — Turns',
    content: [
      'Distance: 10 meters',
      'Time limit: 5 seconds per series',
      'Start position: Back or side to targets',
      'Series 1: 180° turn, 2 shots per target',
      'Series 2: 90° turn left, 2 shots per target',
      'Series 3: 90° turn right, 2 shots per target',
      'Total: 6 shots per target, 12 rounds total',
    ],
  },
  {
    title: 'Stage 3 — Movement & Magazine Change',
    content: [
      'Distance: 10 meters',
      'Time limit: 15 seconds',
      'Start: Back to targets, hands raised',
      'Turn 180°, engage 2 shots on each target at Position A',
      'Move forward, perform mandatory magazine change',
      'Engage 2 more shots on each target at Position B',
      'Move back, perform second mandatory magazine change',
      'Engage 2 more shots on each target at Position C',
      'Pistol: 4+2 shots per target | Rifle: 4+2 shots per target',
    ],
  },
  {
    title: 'Stage 4 — Forward Movement & Magazine Change',
    content: [
      'Starting distance: 20 meters',
      'Time limit: 25 seconds',
      'Standing at 20m: 2 shots per target',
      'Move forward to 15m, assume kneeling position: 2 shots per target',
      'Move forward to 10m, assume prone or kneeling: 2 shots per target',
      'Total: 6 shots per target, 12 rounds total',
      'Magazine changes may be required between positions.',
    ],
  },
  {
    title: 'Stage 5 — Backward Movement',
    content: [
      'Shooter must declare pistol or rifle before starting this stage.',
      '',
      'PISTOL version:',
      'Start distance: 10 meters',
      'Time limit: 15 seconds',
      '4 shots per target at 10m',
      'Move backward to 15m',
      '4 more shots per target',
      'Total: 4+4 = 8 shots per target',
      '',
      'RIFLE version:',
      'Distance: 20 meters (3 positions)',
      'Time limit: 15 seconds',
      'Position A: 6 shots per target',
      'Position B: 6 shots per target',
      'Position C: 6 shots per target',
      'Total: 6+6 = 12 shots per target',
    ],
  },
  {
    title: 'Safety Rules',
    content: [
      '1. Treat every firearm as if it is loaded at all times.',
      '2. Never point the muzzle at anything you are not willing to destroy.',
      '3. Keep your finger off the trigger until your sights are on the target and you have made the decision to shoot.',
      '4. Know your target and what is beyond it.',
      '',
      'Violations of safety rules will result in immediate DQ.',
      'The Range Officer (RO) has authority to stop shooting at any time.',
      'Holstering and drawing: Follow RO commands explicitly.',
      '"STOP" command: Cease fire immediately, safe the weapon.',
    ],
  },
  {
    title: 'Disqualification',
    content: [
      'A shooter may be disqualified for:',
      '• Unsafe handling of a firearm',
      '• Pointing a firearm at any person',
      '• Negligent discharge',
      '• Failure to follow RO commands',
      '• Unsportsmanlike conduct',
      '• Cheating or falsification of scores',
      '',
      'Disqualification results in a failed test and removal from the range.',
    ],
  },
  {
    title: 'Equipment Rules',
    content: [
      'Pistol: Semi-automatic handgun chambered in approved caliber.',
      'Rifle: Semi-automatic rifle or carbine as approved.',
      'Holsters: Must retain weapon securely during movement.',
      'Magazine pouches: Must be on the belt, accessible for reloads.',
      'Eye and ear protection: Mandatory for all range participants.',
      'Approved calibers: As specified by the organizer.',
    ],
  },
]

export default function RulesView() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <Layout title="Rules" backTo="/">
      <div className="p-4 space-y-2 max-w-xl mx-auto">
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-3 mb-4">
          <p className="text-sm text-blue-300">
            Official SRA (Applied Reserve Military Shooting) shooting test rules. Pass requirement: Hit Factor ≥ 1.3
          </p>
        </div>

        {RULES_SECTIONS.map((section, i) => (
          <div key={i} className="bg-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="font-semibold text-slate-200">{section.title}</span>
              <svg
                className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expanded === i ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            {expanded === i && (
              <div className="px-4 pb-4 border-t border-slate-700 pt-3">
                <ul className="space-y-1.5">
                  {section.content.map((line, j) => (
                    <li key={j} className={line === '' ? 'h-1' : 'text-sm text-slate-400 leading-relaxed'}>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  )
}
