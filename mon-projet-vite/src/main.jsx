// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import './styles/modern-design-system.css'
import './styles/modern-animations.css'
import './styles/modern-responsive.css'
import './pages/components/css/mobile-menu-fix.css'
import './pages/components/css/chartjs-fix.css'
import { initToast } from './pages/components/ui/Toast'

// Configuration Chart.js v4 - Stable positioning
import Chart from 'chart.js/auto'
Chart.defaults.maintainAspectRatio = false
Chart.defaults.responsive = true
Chart.defaults.animation = {
    duration: 0 // Désactive les animations mais garde responsive
}
Chart.defaults.layout = { padding: 10 }
Chart.defaults.elements.point.radius = 3

// Configuration stable
Chart.defaults.interaction = {
    intersect: false,
    mode: 'nearest'
}

// Initialiser le système de toast
initToast('top-right');

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
