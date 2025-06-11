import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LandingPage } from './components/LandingPage'
import { CreateRoom } from './components/CreateRoom'
import { JoinRoom } from './components/JoinRoom'
import { ChatRoom } from './components/ChatRoom'

function App() {
  console.log('🚀 App: Component rendered')
  
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/join/:roomId" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<ChatRoom />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App