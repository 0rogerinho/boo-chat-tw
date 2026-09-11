import { useState } from 'react'
import Routers from './router'
import { UpdateNotification } from './shared/components/UpdateNotification'
import { isElectronRuntime, isObsOverlayRoute } from './shared/overlay/runtime'

function App() {
  const [showUpdateNotification, setShowUpdateNotification] = useState(true)
  const showUpdater = isElectronRuntime && !isObsOverlayRoute()

  return (
    <>
      <Routers />
      {showUpdater && showUpdateNotification && (
        <UpdateNotification onClose={() => setShowUpdateNotification(false)} />
      )}
    </>
  )
}

export default App
