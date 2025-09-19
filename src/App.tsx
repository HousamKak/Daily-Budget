import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PaperBudget from './components/PaperBudget'
import Analytics from './components/Analytics'
import { NavigationPanel } from './components/NavigationPanel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative">
          <NavigationPanel />
          <Routes>
            <Route path="/" element={<PaperBudget />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App