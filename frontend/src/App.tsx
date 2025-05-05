import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './app/Home/page'
import Login from "./app/Login/page"
import { UserProvider } from './hooks/UserContext'
import { AlertProvider } from './components/ui-alert-dialog'

function App() {
  return (
      <UserProvider>
        <AlertProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home/>} />
            </Routes>
          </Router>
        </AlertProvider>
      </UserProvider>
  )
}

export default App
