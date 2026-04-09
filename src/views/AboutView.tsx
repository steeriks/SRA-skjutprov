import React from 'react'
import Layout from '../components/Layout'

export default function AboutView() {
  return (
    <Layout title="About" backTo="/">
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* App info */}
        <div className="bg-slate-800 rounded-xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-700 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-12 h-12">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#94a3b8" strokeWidth="3"/>
              <circle cx="32" cy="32" r="18" fill="none" stroke="#94a3b8" strokeWidth="2"/>
              <circle cx="32" cy="32" r="8" fill="none" stroke="#94a3b8" strokeWidth="2"/>
              <circle cx="32" cy="32" r="3" fill="#ef4444"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">SRA Shooting Test</h1>
          <p className="text-slate-400 mt-1">Version 1.0.0</p>
          <p className="text-sm text-slate-500 mt-3">
            Applied Reserve Military Shooting — Practical shooting test management application.
          </p>
        </div>

        {/* Features */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-slate-200">Features</h2>
          {[
            ['Offline capable', 'Works without internet connection after first load'],
            ['5-stage scoring', 'Full scoring for all SRA test stages'],
            ['Hit Factor calculation', 'Real-time HF computation and pass/fail determination'],
            ['PDF generation', 'Generate printable result cards'],
            ['QR sharing', 'Share results via QR code or link'],
            ['Voice announcements', 'Audio announcement of current shooter'],
            ['PWA installable', 'Install on home screen for app-like experience'],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3">
              <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              <div>
                <div className="text-sm font-medium text-slate-200">{title}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="font-semibold text-slate-200 mb-3">Privacy Notice</h2>
          <div className="space-y-2 text-sm text-slate-400">
            <p>
              This app stores all data locally on your device using your browser's localStorage. No data is transmitted to any server.
            </p>
            <p>
              When you generate a result link or QR code, the shooter's scoring data is compressed and embedded directly in the URL. Anyone with the link can view the result.
            </p>
            <p>
              No analytics, tracking, or external services are used.
            </p>
            <p>
              To clear all stored data, use the "Reset Event" button on the home screen, or clear your browser's site data.
            </p>
          </div>
        </div>

        {/* Install PWA */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="font-semibold text-slate-200 mb-2">Install App</h2>
          <p className="text-sm text-slate-400">
            This app can be installed on your device for offline use. Look for the "Add to Home Screen" option in your browser menu, or use the install prompt if it appears.
          </p>
        </div>

        {/* Tech stack */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="font-semibold text-slate-200 mb-3">Built With</h2>
          <div className="flex flex-wrap gap-2">
            {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand', 'pdf-lib', 'QRCode', 'pako', 'PWA'].map((tech) => (
              <span key={tech} className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-slate-600 py-4">
          SRA Shooting Test App · For official use at licensed shooting ranges only
        </div>
      </div>
    </Layout>
  )
}
