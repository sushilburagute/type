import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// only the default editor font ships in the critical path; serif/sans load on demand
import '@fontsource/geist-mono/latin-400.css'
import '@fontsource/geist-mono/latin-700.css'
import '@/styles/index.css'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
