import { Config } from '../modules/Config'
import { Chat } from '../modules/Chat'
import { Routes, Route, HashRouter } from 'react-router-dom'

export default function Routers() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/overlay" element={<Chat overlay />} />
        <Route path="/live" element={<Chat live />} />
        <Route path={`/config`} element={<Config />} />
      </Routes>
    </HashRouter>
  )
}

