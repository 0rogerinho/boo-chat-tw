import { useState } from 'react'
import Routers from './shared/router'
import { UpdateNotification } from './shared/components/UpdateNotification'

function App() {
  const [showUpdateNotification, setShowUpdateNotification] = useState(true)

  return (
    <>
      <Routers />
      {showUpdateNotification && (
        <UpdateNotification onClose={() => setShowUpdateNotification(false)} />
      )}
    </>
  )
}

export default App
