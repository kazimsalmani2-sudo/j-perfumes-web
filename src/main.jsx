import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/firebase'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

window.addEventListener('error', (e) => {
  document.body.innerHTML += `<div style="color:red; background:white; padding:20px; z-index:9999; position:fixed; top:0; left:0; width:100%;">${e.message}<br/>${e.filename}:${e.lineno}</div>`;
});
window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML += `<div style="color:red; background:white; padding:20px; z-index:9999; position:fixed; top:0; left:0; width:100%;">${e.reason}</div>`;
});
