import { installBrowserBridge } from './shared/overlay/installBrowserBridge'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

installBrowserBridge()

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
