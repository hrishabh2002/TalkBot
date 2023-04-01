import React from 'react'
import { BrowserRouter ,Link, Route,Routes } from 'react-router-dom'
import {Home, Ai_chatbot} from './pages';

import {TalkBot} from './assets';
const App = () => {
  return (
    <BrowserRouter>
    <header className="w-full flex justify-between items-center bg-white sm:px-8 px-4 py-4 border-b border-b-[#e6ebf4] ">
      <Link to="/">
        <img src={TalkBot} alt="logo" className="w-28 object-contain" />
      </Link>

      <Link to="/create-chat" className="font-inter font-medium bg-[#6469ff] text-white px-4 py-2 rounded-md">Chat</Link>
    </header>
    <main className="sm:p-8 px-4 py-8 w-full bg-[#f9fafe] min-h-[calc(100vh-73px)]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-chat" element={<Ai_chatbot />} />
      </Routes>
    </main>
  </BrowserRouter>
  )
}

export default App
