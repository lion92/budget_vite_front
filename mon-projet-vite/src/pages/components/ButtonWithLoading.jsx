import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const ButtonWithLoading = ({ 
    children, 
    onClick, 
    loading = false, 
    disabled = false, 
    variant = 'primary',
    size = 'medium',
    icon = null,
    loadingText = 'Chargement...',
    className = '',
    ...props 
}) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const variants = {
        primary: {
            background: 'var(--gradient-primary)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
        },
        secondary: {
            background: 'rgba(255, 255, 255, 0.9)',
            color: 'var(--text-primary)',
            border: '2px solid var(--primary-300)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        },
        danger: {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
        },
        success: {
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
        },
        outline: {
            background: 'transparent',
            color: 'var(--primary-600)',
            border: '2px solid var(--primary-600)',
            boxShadow: 'none',
        }
    };

    const sizes = {
        small: {
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '8px',
        },
        medium: {
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '12px',
        },
        large: {
            padding: '16px 32px',
            fontSize: '18px',
            borderRadius: '16px',
        }
    };

    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        opacity: disabled ? 0.6 : 1,
        transform: isPressed ? 'translateY(1px)' : (isHovered && !disabled && !loading) ? 'translateY(-2px)' : 'translateY(0)',
        ...variants[variant],
        ...sizes[size],
    };

    const hoverStyles = !disabled && !loading && isHovered ? {
        boxShadow: variant === 'primary' 
            ? '0 8px 25px rgba(139, 92, 246, 0.4)' 
            : variant === 'danger'
            ? '0 8px 25px rgba(239, 68, 68, 0.4)'
            : variant === 'success'
            ? '0 8px 25px rgba(34, 197, 94, 0.4)'
            : '0 6px 20px rgba(0, 0, 0, 0.15)',
        ...(variant === 'outline' ? {
            background: 'var(--primary-50)',
            borderColor: 'var(--primary-500)',
        } : {})
    } : {};

    const handleClick = async (e) => {
        if (disabled || loading) return;
        
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
        
        if (onClick) {
            await onClick(e);
        }
    };

    return (
        <button
            style={{
                ...baseStyles,
                ...hoverStyles,
            }}
            onClick={handleClick}
            disabled={disabled || loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={className}
            {...props}
        >
            {/* Effet de brillance */}
            <span
                style={{
                    position: 'absolute',
                    top: 0,
                    left: isHovered ? '100%' : '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transition: 'left 0.6s',
                    pointerEvents: 'none',
                }}
            />
            
            {loading ? (
                <>
                    <LoadingSpinner 
                        size="small" 
                        color="white" 
                        showMessage={false} 
                    />
                    <span>{loadingText}</span>
                </>
            ) : (
                <>
                    {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
};

export default ButtonWithLoading;