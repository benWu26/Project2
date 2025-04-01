import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './app/page'
import Login from "./components/login"
import { UserProvider } from './hooks/UserContext'

function App() {
  return (
  <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home/>} />
          </Routes>
        </Router>
      </UserProvider>
  )
}

export default App
