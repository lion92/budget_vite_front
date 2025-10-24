import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Fonction pour créer des options sûres et minimales
const createSafeOptions = (type) => {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        animations: false,
        transitions: {
            active: {
                animation: {
                    duration: 0
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            tooltip: {
                enabled: true,
                mode: 'nearest',
                intersect: true,
                position: 'nearest',
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
        }
    };

    // Pour les graphiques avec axes
    if (type !== 'pie' && type !== 'doughnut') {
        baseOptions.scales = {
            x: {
                display: true,
                grid: {
                    display: true
                }
            },
            y: {
                display: true,
                beginAtZero: true,
                grid: {
                    display: true
                },
                ticks: {
                    callback: function(value) {
                        return value.toFixed(0) + ' €';
                    }
                }
            }
        };
        baseOptions.elements = {
            point: {
                radius: 3
            }
        };
    }

    return baseOptions;
};

const NativeChart = ({ type, data, options, onError }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('NativeChart useEffect - Données reçues:', data);
            console.log('NativeChart useEffect - Type:', type);
            console.log('NativeChart useEffect - Options:', options);
        }

        const canvas = canvasRef.current;
        if (!canvas) {
            console.warn('NativeChart: Canvas non trouvé');
            return;
        }

        if (!data) {
            console.warn('NativeChart: Pas de données');
            return;
        }

        if (!data.labels || data.labels.length === 0) {
            console.warn('NativeChart: Pas de labels dans les données');
            return;
        }

        if (!data.datasets || data.datasets.length === 0) {
            console.warn('NativeChart: Pas de datasets dans les données');
            return;
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('NativeChart: Création du graphique...');
        }

        // Détruire l'ancien graphique s'il existe
        if (chartRef.current) {
            try {
                // Arrêter toutes les animations en cours
                if (chartRef.current.stop) {
                    chartRef.current.stop();
                }
                // Détruire le graphique
                chartRef.current.destroy();
                chartRef.current = null;
                console.log('Ancien graphique détruit');
            } catch (e) {
                console.warn('Erreur destruction ancien graphique:', e);
                chartRef.current = null;
            }
        }

        try {
            // Créer un nouveau contexte 2D
            const ctx = canvas.getContext('2d');

            // Vérifier si un graphique existe déjà pour ce canvas
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                try {
                    // Arrêter toutes les animations en cours
                    if (existingChart.stop) {
                        existingChart.stop();
                    }
                    existingChart.destroy();
                    console.log('Graphique existant détruit');
                } catch (e) {
                    console.warn('Erreur destruction graphique existant:', e);
                }
            }

            // Utiliser des options sûres et simples
            const safeOptions = createSafeOptions(type);
            if (process.env.NODE_ENV === 'development') {
                console.log('Options sûres créées:', safeOptions);
            }

            const config = {
                type: type || 'line',
                data: {
                    ...data,
                    datasets: data.datasets?.map(dataset => ({
                        ...dataset,
                        // Supprimer les propriétés React spécifiques
                        id: undefined,
                        key: undefined
                    }))
                },
                options: safeOptions
            };

            // Log de debug avant création
            if (process.env.NODE_ENV === 'development') {
                console.log('Configuration du graphique:', config);
            }

            // Créer le nouveau graphique
            const newChart = new Chart(ctx, config);
            chartRef.current = newChart;

            if (process.env.NODE_ENV === 'development') {
                console.log('Nouveau graphique créé avec ID:', newChart.id);
            }

        } catch (error) {
            console.error('Erreur création graphique natif:', error);
            if (onError) onError(error);
        }

        // Cleanup lors du démontage
        return () => {
            if (chartRef.current) {
                try {
                    // Arrêter toutes les animations avant de détruire
                    if (chartRef.current.stop) {
                        chartRef.current.stop();
                    }
                    chartRef.current.destroy();
                    chartRef.current = null;
                } catch (e) {
                    console.warn('Erreur cleanup NativeChart:', e);
                    chartRef.current = null;
                }
            }
        };
    }, [type, data, options]);

    return (
        <div className="native-chart-container">
            <canvas
                ref={canvasRef}
                id={`chart-canvas-${type}-${Math.random().toString(36).substr(2, 9)}`}
                style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%'
                }}
            />
        </div>
    );
};

export default NativeChart;