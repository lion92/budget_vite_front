import React from 'react';

class ChartErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Met à jour le state pour afficher l'UI d'erreur
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log l'erreur pour debugging
        console.error('Chart Error Boundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        // Force le re-render du parent si une fonction de refresh est fournie
        if (this.props.onRetry) {
            this.props.onRetry();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="chart-error-boundary">
                    <div className="error-icon">⚠️</div>
                    <h3>Erreur de graphique</h3>
                    <p>Une erreur s'est produite lors du rendu du graphique.</p>
                    <div className="error-details">
                        <details>
                            <summary>Détails de l'erreur</summary>
                            <pre>{this.state.error?.toString()}</pre>
                        </details>
                    </div>
                    <div className="error-actions">
                        <button
                            onClick={this.handleRetry}
                            className="btn btn-outline"
                        >
                            Réessayer
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-outline"
                        >
                            Recharger la page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ChartErrorBoundary;