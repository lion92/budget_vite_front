import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

const SafeChart = ({ type, data, options, onError }) => {
    const containerRef = useRef(null);
    const portalRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [chartInstance, setChartInstance] = useState(null);

    // Créer un conteneur DOM isolé pour le graphique
    useEffect(() => {
        if (!portalRef.current) {
            const portalContainer = document.createElement('div');
            portalContainer.className = 'chart-portal';
            portalContainer.style.width = '100%';
            portalContainer.style.height = '100%';
            portalContainer.style.position = 'relative';
            portalRef.current = portalContainer;
        }

        if (containerRef.current && portalRef.current) {
            containerRef.current.appendChild(portalRef.current);
        }

        return () => {
            if (portalRef.current && portalRef.current.parentNode) {
                portalRef.current.parentNode.removeChild(portalRef.current);
            }
        };
    }, []);

    // Force une re-création complète à chaque changement
    const forceRecreate = () => {
        console.log('SafeChart: Force recreation');
        setIsVisible(false);

        // Nettoyer l'ancien graphique s'il existe
        if (chartInstance) {
            try {
                chartInstance.destroy();
            } catch (e) {
                console.warn('Erreur destruction ancien graphique:', e);
            }
        }

        // Petit délai pour s'assurer que le DOM est nettoyé
        setTimeout(() => {
            setIsVisible(true);
        }, 100);
    };

    // Re-créer le graphique quand les données changent
    useEffect(() => {
        forceRecreate();
    }, [type, data, options]);

    // Nettoyage lors du démontage
    useEffect(() => {
        return () => {
            if (chartInstance) {
                try {
                    chartInstance.destroy();
                } catch (e) {
                    console.warn('Erreur nettoyage SafeChart:', e);
                }
            }
        };
    }, [chartInstance]);

    const renderChart = () => {
        if (!isVisible || !data || !data.labels || !data.datasets) {
            return null;
        }

        const chartProps = {
            data,
            options: {
                ...options,
                responsive: true,
                maintainAspectRatio: false,
                animation: false // Désactiver les animations
            },
            key: `safe-chart-${Date.now()}-${Math.random()}`,
            onCreated: (chart) => {
                console.log('Graphique SafeChart créé:', chart.id);
                setChartInstance(chart);
            },
            onDestroy: () => {
                console.log('Graphique SafeChart détruit');
                setChartInstance(null);
            }
        };

        try {
            switch (type) {
                case 'line':
                    return <Line {...chartProps} />;
                case 'bar':
                    return <Bar {...chartProps} />;
                case 'pie':
                    return <Pie {...chartProps} />;
                case 'doughnut':
                    return <Doughnut {...chartProps} />;
                default:
                    return <Line {...chartProps} />;
            }
        } catch (error) {
            console.error('Erreur rendu SafeChart:', error);
            if (onError) onError(error);
            return (
                <div className="chart-error">
                    <div className="error-icon">⚠️</div>
                    <h3>Erreur de rendu</h3>
                    <p>Impossible de créer le graphique</p>
                </div>
            );
        }
    };

    return (
        <div
            ref={containerRef}
            className="safe-chart-container"
            key={`container-${isVisible ? 'visible' : 'hidden'}`}
        >
            {isVisible && portalRef.current && createPortal(
                renderChart(),
                portalRef.current
            )}
        </div>
    );
};

export default SafeChart;