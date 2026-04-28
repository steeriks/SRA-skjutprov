import Layout from '../components/Layout'

export default function AboutView() {
  return (
    <Layout title="Om" backTo="/">
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* Appinfo */}
        <div className="bg-slate-800 rounded-xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-700 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-12 h-12">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#94a3b8" strokeWidth="3"/>
              <circle cx="32" cy="32" r="18" fill="none" stroke="#94a3b8" strokeWidth="2"/>
              <circle cx="32" cy="32" r="8" fill="none" stroke="#94a3b8" strokeWidth="2"/>
              <circle cx="32" cy="32" r="3" fill="#ef4444"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">SRA Skjutprov</h1>
          <p className="text-slate-400 mt-1">Version 1.0.0</p>
          <p className="text-sm text-slate-500 mt-3">
            Tillämpad reservmilitär skytte — Hanteringsapp för praktiska skjutprov.
          </p>
        </div>

        {/* Funktioner */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-slate-200">Funktioner</h2>
          {[
            ['Fungerar offline', 'Fungerar utan internetanslutning efter första laddning'],
            ['5-moments poängräkning', 'Fullständig poängräkning för alla SRA-provmoment'],
            ['Träfffaktorberäkning', 'Realtidsberäkning av TF och GK/UK-bestämning'],
            ['PDF-generering', 'Generera utskrivbara resultatkort'],
            ['QR-delning', 'Dela resultat via QR-kod eller länk'],
            ['Röstmeddelanden', 'Ljudmeddelanden för aktuell skytt'],
            ['PWA-installerbar', 'Installera på hemskärmen för app-liknande upplevelse'],
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

        {/* Integritet */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="font-semibold text-slate-200 mb-3">Integritetspolicy</h2>
          <div className="space-y-2 text-sm text-slate-400">
            <p>
              Appen lagrar all data lokalt på din enhet via webbläsarens localStorage. Ingen data skickas till någon server.
            </p>
            <p>
              När du genererar en resultatlänk eller QR-kod komprimeras skyttarens poängdata och bäddas in direkt i URL:en. Alla med länken kan se resultatet.
            </p>
            <p>
              Inga analyser, spårning eller externa tjänster används.
            </p>
            <p>
              För att rensa all lagrad data, använd knappen "Återställ prov" på startskärmen, eller rensa webbläsarens webbplatsdata.
            </p>
          </div>
        </div>

        {/* Installera PWA */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="font-semibold text-slate-200 mb-2">Installera appen</h2>
          <p className="text-sm text-slate-400">
            Appen kan installeras på din enhet för offlineanvändning. Leta efter "Lägg till på hemskärmen" i webbläsarmenyn, eller använd installationsprompten om den visas.
          </p>
        </div>

        {/* Teknikstack */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h2 className="font-semibold text-slate-200 mb-3">Byggd med</h2>
          <div className="flex flex-wrap gap-2">
            {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand', 'pdf-lib', 'QRCode', 'pako', 'PWA'].map((tech) => (
              <span key={tech} className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-slate-600 py-4">
          SRA Skjutprov · Endast för officiellt bruk på licensierade skjutbanor
        </div>
      </div>
    </Layout>
  )
}
