import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Auto-heal Vite chunk load errors when bundles update across active sessions
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && /Failed to fetch dynamically imported module/i.test(event.reason?.message || '')) {
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
