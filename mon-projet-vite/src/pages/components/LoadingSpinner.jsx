import React from 'react';

const LoadingSpinner = ({ 
    size = 'medium', 
    color = 'primary', 
    message = 'Chargement...', 
    overlay = false,
    showMessage = true 
}) => {
    const sizes = {
        small: { width: 20, height: 20 },
        medium: { width: 40, height: 40 },
        large: { width: 60, height: 60 }
    };

    const colors = {
        primary: 'var(--primary-500)',
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        white: '#ffffff'
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(5px)',
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: overlay ? '30px' : '20px',
            background: overlay ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
            borderRadius: overlay ? '16px' : '0',
            boxShadow: overlay ? '0 20px 60px rgba(0, 0, 0, 0.15)' : 'none',
        },
        spinner: {
            width: sizes[size].width,
            height: sizes[size].height,
            border: `3px solid rgba(${colors[color]}, 0.1)`,
            borderTop: `3px solid ${colors[color]}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
        },
        dots: {
            display: 'flex',
            gap: '8px',
        },
        dot: {
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: colors[color],
            animation: 'bounce 1.4s ease-in-out infinite',
        },
        message: {
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontWeight: '500',
            textAlign: 'center',
            maxWidth: '200px',
        },
        pulse: {
            width: sizes[size].width,
            height: sizes[size].height,
            borderRadius: '50%',
            background: colors[color],
            animation: 'pulse 2s ease-in-out infinite',
        },
        wave: {
            display: 'flex',
            gap: '4px',
        },
        bar: {
            width: '4px',
            height: '40px',
            background: colors[color],
            borderRadius: '2px',
            animation: 'wave 1.2s ease-in-out infinite',
        }
    };

    const SpinnerComponent = ({ type = 'spinner' }) => {
        switch (type) {
            case 'dots':
                return (
                    <div style={styles.dots}>
                        {[...Array(3)].map((_, i) => (
                            <div 
                                key={i}
                                style={{
                                    ...styles.dot,
                                    animationDelay: `${i * 0.16}s`
                                }}
                            />
                        ))}
                    </div>
                );
            
            case 'pulse':
                return <div style={styles.pulse} />;
            
            case 'wave':
                return (
                    <div style={styles.wave}>
                        {[...Array(5)].map((_, i) => (
                            <div 
                                key={i}
                                style={{
                                    ...styles.bar,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                );
            
            default:
                return <div style={styles.spinner} />;
        }
    };

    const content = (
        <div style={styles.container}>
            <SpinnerComponent type="spinner" />
            {showMessage && <div style={styles.message}>{message}</div>}
        </div>
    );

    if (overlay) {
        return (
            <div style={styles.overlay}>
                {content}
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes bounce {
                        0%, 80%, 100% {
                            transform: scale(0);
                        }
                        40% {
                            transform: scale(1);
                        }
                    }
                    
                    @keyframes pulse {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(0.8);
                            opacity: 0.5;
                        }
                    }
                    
                    @keyframes wave {
                        0%, 40%, 100% {
                            transform: scaleY(0.4);
                        }
                        20% {
                            transform: scaleY(1);
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <>
            {content}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    }
                    40% {
                        transform: scale(1);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                }
                
                @keyframes wave {
                    0%, 40%, 100% {
                        transform: scaleY(0.4);
                    }
                    20% {
                        transform: scaleY(1);
                    }
                }
            `}</style>
        </>
    );
};

export default LoadingSpinner;