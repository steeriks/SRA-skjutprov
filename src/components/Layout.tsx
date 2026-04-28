import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

interface LayoutProps {
  children: ReactNode
  title?: string
  backTo?: string
  rightAction?: ReactNode
}

export default function Layout({ children, title, backTo, rightAction }: LayoutProps) {
  const location = useLocation()
  const muted = useStore((s) => s.muted)
  const setMuted = useStore((s) => s.setMuted)

  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="flex items-center h-14 px-4 gap-3">
          {backTo && (
            <Link
              to={backTo}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <div className="flex-1 min-w-0">
            {title ? (
              <h1 className="text-base font-semibold text-slate-100 truncate">{title}</h1>
            ) : (
              <div className="flex items-center gap-2">
                <img src="/SRA-skjutprov/SPSF_logo.svg" alt="SPSF" className="h-8 w-auto" />
                <span className="text-base font-semibold text-slate-100">SRA Skjutprov</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {rightAction}
            <button
              onClick={() => setMuted(!muted)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-700 transition-colors text-slate-400"
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-4-4m4 4l4-4M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom nav */}
      {isHome && (
        <nav className="bg-slate-800 border-t border-slate-700 safe-area-bottom">
          <div className="flex items-center justify-around h-16">
            <Link to="/" className="flex flex-col items-center gap-1 text-blue-400 min-w-[60px]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <span className="text-xs">Hem</span>
            </Link>
            <Link to="/rules" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 min-w-[60px]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span className="text-xs">Regler</span>
            </Link>
            <Link to="/about" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 min-w-[60px]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-xs">Om</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  )
}
