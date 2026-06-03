import './styles/globals.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

const container = document.getElementById('root')!
const root = (container as any).__reactRoot ?? createRoot(container)
;(container as any).__reactRoot = root

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
