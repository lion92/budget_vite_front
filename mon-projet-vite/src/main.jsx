// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import './pages/components/css/mobile-menu-fix.css'
import { initToast } from './pages/components/ui/Toast'

// Initialiser le système de toast
initToast('top-right');

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
