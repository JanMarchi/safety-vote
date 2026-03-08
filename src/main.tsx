import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initWebVitalsMonitoring } from './lib/web-vitals'

// Initialize Web Vitals monitoring
if (typeof window !== 'undefined') {
  initWebVitalsMonitoring()
}

createRoot(document.getElementById("root")!).render(<App />);
