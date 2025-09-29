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
import './pages/components/css/hover-fixes.css'
import { initToast } from './pages/components/ui/Toast'

// Configuration Chart.js v4 - Configuration améliorée
import Chart from 'chart.js/auto'
Chart.defaults.maintainAspectRatio = false
Chart.defaults.responsive = true
Chart.defaults.animation = {
    duration: 300, // Animation courte pour éviter les bugs
    easing: 'easeInOutQuad'
}
Chart.defaults.layout = { padding: 10 }
Chart.defaults.elements.point.radius = 3

// Configuration stable pour les interactions
Chart.defaults.interaction = {
    intersect: false,
    mode: 'nearest'
}

// Configuration des plugins
Chart.defaults.plugins.legend = {
    display: true,
    position: 'top',
    title: {
        display: false,
        font: {
            size: 12
        }
    }
}

Chart.defaults.plugins.tooltip = {
    enabled: true,
    mode: 'nearest',
    intersect: false
}

// Initialiser le système de toast
initToast('top-right');

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
