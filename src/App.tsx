import { Routes, Route } from 'react-router-dom'
import ShooterListView from './views/ShooterListView'
import SafetyView from './views/SafetyView'
import ScoringView from './views/ScoringView'
import ShooterDetailView from './views/ShooterDetailView'
import ResultCardView from './views/ResultCardView'
import RulesView from './views/RulesView'
import AboutView from './views/AboutView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ShooterListView />} />
      <Route path="/safety" element={<SafetyView />} />
      <Route path="/scoring/:stage/:shooter" element={<ScoringView />} />
      <Route path="/shooter/:name" element={<ShooterDetailView />} />
      <Route path="/result/:name" element={<ResultCardView />} />
      <Route path="/result" element={<ResultCardView />} />
      <Route path="/rules" element={<RulesView />} />
      <Route path="/about" element={<AboutView />} />
    </Routes>
  )
}
