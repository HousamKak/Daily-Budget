import { AuthProvider } from './contexts/AuthContext'
import PaperBudget from './components/PaperBudget'

function App() {
  return (
    <AuthProvider>
      <PaperBudget />
    </AuthProvider>
  )
}

export default App