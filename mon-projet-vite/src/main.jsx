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
import './pages/components/css/viewport-optimization.css'
import { initToast } from './pages/components/ui/Toast'

// Configuration Chart.js v4 - Configuration améliorée et sécurisée
import Chart from 'chart.js/auto'
Chart.defaults.maintainAspectRatio = false
Chart.defaults.responsive = true

// Désactiver complètement les animations pour éviter les bugs
Chart.defaults.animation = false
Chart.defaults.animations = {
    colors: false,
    x: false,
    y: false
}
Chart.defaults.transitions = {
    active: {
        animation: {
            duration: 0
        }
    }
}

Chart.defaults.layout = { padding: 10 }
Chart.defaults.elements.point.radius = 3

// Configuration stable pour les interactions
Chart.defaults.interaction = {
    intersect: true,
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
    intersect: true,
    position: 'nearest', // FIX: Spécifier la position pour éviter l'erreur positioners
    callbacks: {
        label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
                label += ': ';
            }
            if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(2) + ' €';
            } else if (context.parsed !== null) {
                label += context.parsed.toFixed(2) + ' €';
            }
            return label;
        }
    }
}

// Initialiser le système de toast
initToast('top-right');

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
