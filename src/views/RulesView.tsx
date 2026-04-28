import { useState } from 'react'
import Layout from '../components/Layout'

const RULES_SECTIONS = [
  {
    title: 'Allmänna regler',
    content: [
      'SRA-skjutprovet utvärderar praktiska skjutfärdigheter för tillämpad reservmilitär skytte.',
      'Provet består av 5 moment som var och ett testar olika aspekter av stridsskjutning.',
      'En minsta träfffaktor på 1,3 krävs för att bli godkänd på provet.',
      'Diskvalificering (DK) innebär automatiskt underkänt på hela provet.',
      'Domarens beslut är slutgiltigt i alla tolkningsfrågor.',
    ],
  },
  {
    title: 'Poängsystem',
    content: [
      'Alpha (A): 5 poäng — Bästa zon, mitten av målet',
      'Charlie (C): 3 poäng — Bra zon, acceptabel träff',
      'Delta (D): 1 poäng — Marginalzon, perifer träff',
      'Miss (M): −10 poäng — Ingen träff på målet',
      'Procedural (P): −10 poäng — Regelöverträdelse',
      'Träfffaktor (TF) = Totalt antal poäng ÷ Total tid',
      'Endast moment där alla obligatoriska skott är registrerade räknas mot slutlig TF.',
    ],
  },
  {
    title: 'Moment 1 – Bilateral & Enstämmigt skjutande',
    content: [
      'Avstånd: 10 meter',
      'Tidsgräns: 5 sekunder per serie',
      'Serie 1: Båda händerna — 2 skott per mål',
      'Serie 2: Stark hand — 2 skott per mål',
      'Serie 3: Svag hand — 2 skott per mål',
      'Totalt: 6 skott per mål, 12 patroner totalt',
      'Gäller för både pistol och gevär.',
    ],
  },
  {
    title: 'Moment 2 – Vändningar',
    content: [
      'Avstånd: 10 meter',
      'Tidsgräns: 5 sekunder per serie',
      'Startposition: Rygg eller sida mot mål',
      'Serie 1: 180°-vändning, 2 skott per mål',
      'Serie 2: 90°-vändning vänster, 2 skott per mål',
      'Serie 3: 90°-vändning höger, 2 skott per mål',
      'Totalt: 6 skott per mål, 12 patroner totalt',
    ],
  },
  {
    title: 'Moment 3 – Förflyttning & Magasinsbyte',
    content: [
      'Avstånd: 10 meter',
      'Tidsgräns: 15 sekunder',
      'Start: Rygg mot mål, händer uppräckta',
      'Vänd 180°, 2 skott på varje mål vid position A',
      'Förflytta framåt, utför obligatoriskt magasinsbyte',
      '2 skott på varje mål vid position B',
      'Förflytta bakåt, utför andra obligatoriska magasinsbyte',
      '2 skott på varje mål vid position C',
      'Pistol: 4+2 skott per mål | Gevär: 4+2 skott per mål',
    ],
  },
  {
    title: 'Moment 4 – Framåtrörelse & Magasinsbyte',
    content: [
      'Startavstånd: 20 meter',
      'Tidsgräns: 25 sekunder',
      'Stående vid 20m: 2 skott per mål',
      'Förflytta till 15m, knäläge: 2 skott per mål',
      'Förflytta till 10m, liggande eller knäläge: 2 skott per mål',
      'Totalt: 6 skott per mål, 12 patroner totalt',
      'Magasinsbyte kan krävas mellan positioner.',
    ],
  },
  {
    title: 'Moment 5 – Bakåtrörelse',
    content: [
      'Skytten måste deklarera pistol eller gevär innan momentet påbörjas.',
      '',
      'PISTOL:',
      'Startavstånd: 10 meter',
      'Tidsgräns: 15 sekunder',
      '4 skott per mål vid 10m',
      'Förflytta bakåt till 15m',
      '4 skott per mål',
      'Totalt: 4+4 = 8 skott per mål',
      '',
      'GEVÄR:',
      'Avstånd: 20 meter (3 positioner)',
      'Tidsgräns: 15 sekunder',
      'Position A: 6 skott per mål',
      'Position B: 6 skott per mål',
      'Position C: 6 skott per mål',
      'Totalt: 6+6 = 12 skott per mål',
    ],
  },
  {
    title: 'Säkerhetsregler',
    content: [
      '1. Behandla varje skjutvapen som om det är laddat.',
      '2. Rikta aldrig mynningen mot något du inte är beredd att förstöra.',
      '3. Håll fingret utanför avtryckarvakten tills siktet är på målet och du har fattat beslut om att skjuta.',
      '4. Känna till ditt mål och vad som finns bakom det.',
      '',
      'Brott mot säkerhetsreglerna leder till omedelbar diskvalificering.',
      'Skjutledaren (SL) har befogenhet att avbryta skjutning när som helst.',
      'Holstering och dragning: Följ SL:s kommandon exakt.',
      '"STOPP"-kommando: Avbryt eldgivning omedelbart och säkra vapnet.',
    ],
  },
  {
    title: 'Diskvalificering',
    content: [
      'En skytt kan diskvalificeras för:',
      '• Osäker vapenhantering',
      '• Att rikta ett vapen mot en person',
      '• Oavsiktlig avlossning',
      '• Att inte följa SL:s kommandon',
      '• Osportsligt uppförande',
      '• Fusk eller förfalskning av resultat',
      '',
      'Diskvalificering innebär underkänt prov och avlägsnande från skjutbanan.',
    ],
  },
  {
    title: 'Utrustningsregler',
    content: [
      'Pistol: Halvautomatisk pistol i godkänt kaliber.',
      'Gevär: Halvautomatiskt gevär eller karbin enligt godkännande.',
      'Hölster: Måste hålla vapnet säkert under förflyttning.',
      'Magasinfickor: Måste sitta på bältet, åtkomliga för omladdning.',
      'Ögonskydd och hörselskydd: Obligatoriskt för alla på skjutbanan.',
      'Godkända kaliber: Enligt arrangörens specifikation.',
    ],
  },
]

export default function RulesView() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <Layout title="Regler" backTo="/">
      <div className="p-4 space-y-2 max-w-xl mx-auto">
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-3 mb-4">
          <p className="text-sm text-blue-300">
            Officiella regler för SRA-skjutprovet (tillämpad reservmilitär skytte). Godkändgräns: Träfffaktor ≥ 1,3
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
