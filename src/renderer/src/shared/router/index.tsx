import { Config } from '../../modules/Config'
import { Chat } from '../../modules/Chat'
import { Routes, Route, HashRouter } from 'react-router-dom'

export default function Routers() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path={`/config`} element={<Config />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </HashRouter>
  )
}
