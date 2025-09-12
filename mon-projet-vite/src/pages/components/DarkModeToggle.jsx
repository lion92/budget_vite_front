import React, { useState } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

const DarkModeToggle = () => {
    const { isDarkMode, toggleTheme } = useDarkMode();

    const styles = {
        toggleContainer: {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '25px',
            background: isDarkMode 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(139, 92, 246, 0.1)',
            border: `1px solid ${isDarkMode 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(139, 92, 246, 0.2)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)',
        },
        toggleSwitch: {
            position: 'relative',
            width: '50px',
            height: '25px',
            borderRadius: '25px',
            background: isDarkMode 
                ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' 
                : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: `2px solid ${isDarkMode ? '#8b5cf6' : '#cbd5e1'}`,
            boxShadow: isDarkMode 
                ? '0 4px 15px rgba(139, 92, 246, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        toggleBall: {
            position: 'absolute',
            top: '1px',
            left: isDarkMode ? '23px' : '1px',
            width: '21px',
            height: '21px',
            borderRadius: '50%',
            background: isDarkMode 
                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                : 'linear-gradient(135deg, #ffffff, #f8fafc)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isDarkMode 
                ? '0 2px 8px rgba(251, 191, 36, 0.4)' 
                : '0 2px 6px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
        },
        icon: {
            fontSize: '14px',
            opacity: 0.8,
            transition: 'all 0.3s ease',
        },
        label: {
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-primary)',
            transition: 'color 0.3s ease',
            userSelect: 'none',
        }
    };

    const toggleContainerHover = {
        ...styles.toggleContainer,
        transform: 'translateY(-1px)',
        boxShadow: isDarkMode 
            ? '0 8px 25px rgba(139, 92, 246, 0.2)' 
            : '0 4px 15px rgba(0, 0, 0, 0.1)',
    };

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            style={isHovered ? toggleContainerHover : styles.toggleContainer}
            onClick={toggleTheme}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="button"
            tabIndex={0}
            aria-label={`Activer le mode ${isDarkMode ? 'clair' : 'sombre'}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            }}
        >
            <span style={styles.icon}>
                {isDarkMode ? '☀️' : '🌙'}
            </span>
            
            <div style={styles.toggleSwitch}>
                <div style={styles.toggleBall}>
                    {isDarkMode ? '🌙' : '☀️'}
                </div>
            </div>
            
            <span style={styles.label}>
                {isDarkMode ? 'Mode clair' : 'Mode sombre'}
            </span>
        </div>
    );
};

export default DarkModeToggle;