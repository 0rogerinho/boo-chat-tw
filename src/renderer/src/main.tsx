import { installBrowserBridge } from './shared/overlay/installBrowserBridge'
import { applyObsOverlayClass } from './shared/overlay/runtime'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

applyObsOverlayClass()
installBrowserBridge()

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
