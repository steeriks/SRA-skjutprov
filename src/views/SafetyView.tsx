import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useStore } from '../store/useStore'

const SAFETY_RULES = [
  {
    number: 1,
    title: 'Treat every firearm as if it is loaded',
    description:
      'Never assume a firearm is unloaded. Always handle every firearm as if it could fire at any moment. This is the foundation of safe gun handling.',
  },
  {
    number: 2,
    title: 'Never point the muzzle at anything you are not willing to destroy',
    description:
      'Be conscious of where the muzzle is pointing at all times. Never let it cover anything you are not prepared to shoot — including yourself and other people.',
  },
  {
    number: 3,
    title: 'Keep your finger off the trigger until your sights are on the target',
    description:
      'Keep your trigger finger straight and outside the trigger guard until you have made the decision to shoot. This single rule prevents the majority of accidental discharges.',
  },
  {
    number: 4,
    title: 'Know your target and what is beyond it',
    description:
      'Be absolutely sure of your target before firing. Bullets can travel through targets and strike unintended objects or persons. Be aware of what lies beyond your target.',
  },
]

export default function SafetyView() {
  const navigate = useNavigate()
  const { safetyConfirmed, setSafetyConfirmed, shooters } = useStore()

  const handleContinue = () => {
    setSafetyConfirmed(true)
    if (shooters.length > 0) {
      navigate(`/scoring/0/${encodeURIComponent(shooters[0])}`)
    } else {
      navigate('/')
    }
  }

  return (
    <Layout title="Safety Training" backTo="/">
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
              <h2 className="font-bold text-yellow-300">Safety Briefing Required</h2>
              <p className="text-sm text-yellow-400/80 mt-0.5">
                All participants must acknowledge the four fundamental firearm safety rules before proceeding.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {SAFETY_RULES.map((rule) => (
            <div key={rule.number} className="bg-slate-800 rounded-xl p-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                  {rule.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-100 leading-tight">{rule.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">{rule.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <button
            onClick={() => setSafetyConfirmed(!safetyConfirmed)}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              safetyConfirmed ? 'bg-green-600 border-green-600' : 'border-slate-500'
            }`}>
              {safetyConfirmed && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </div>
            <span className="text-slate-200">
              I have read and understood all four safety rules and confirm the safety briefing has been completed for all participants.
            </span>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!safetyConfirmed}
          className="w-full py-4 bg-green-700 hover:bg-green-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold text-lg transition-colors"
        >
          Continue to Scoring
        </button>
      </div>
    </Layout>
  )
}
