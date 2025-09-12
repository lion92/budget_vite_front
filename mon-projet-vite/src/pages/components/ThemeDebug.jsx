import React, { useEffect, useState } from 'react';

const ThemeDebug = () => {
    const [themeInfo, setThemeInfo] = useState({
        dataTheme: '',
        bodyClass: '',
        localStorage: '',
        cssVars: {}
    });

    useEffect(() => {
        const updateThemeInfo = () => {
            const root = document.documentElement;
            const body = document.body;
            const computedStyle = getComputedStyle(root);

            setThemeInfo({
                dataTheme: root.getAttribute('data-theme') || 'none',
                bodyClass: body.classList.contains('dark-mode') ? 'dark-mode' : 'light',
                localStorage: localStorage.getItem('theme') || 'none',
                cssVars: {
                    background: computedStyle.getPropertyValue('--background'),
                    textPrimary: computedStyle.getPropertyValue('--text-primary'),
                    surface: computedStyle.getPropertyValue('--surface')
                }
            });
        };

        updateThemeInfo();
        
        // Observer pour les changements de thème
        const observer = new MutationObserver(updateThemeInfo);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const styles = {
        container: {
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9999,
            maxWidth: '300px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
        },
        title: {
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#a78bfa'
        },
        item: {
            margin: '5px 0',
            display: 'flex',
            justifyContent: 'space-between'
        },
        label: {
            color: '#fbbf24'
        },
        value: {
            color: '#22c55e'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.title}>🔍 Theme Debug</div>
            
            <div style={styles.item}>
                <span style={styles.label}>Data Theme:</span>
                <span style={styles.value}>{themeInfo.dataTheme}</span>
            </div>
            
            <div style={styles.item}>
                <span style={styles.label}>Body Class:</span>
                <span style={styles.value}>{themeInfo.bodyClass}</span>
            </div>
            
            <div style={styles.item}>
                <span style={styles.label}>LocalStorage:</span>
                <span style={styles.value}>{themeInfo.localStorage}</span>
            </div>
            
            <div style={styles.item}>
                <span style={styles.label}>Background:</span>
                <span style={styles.value}>{themeInfo.cssVars.background}</span>
            </div>
            
            <div style={styles.item}>
                <span style={styles.label}>Text:</span>
                <span style={styles.value}>{themeInfo.cssVars.textPrimary}</span>
            </div>
        </div>
    );
};

export default ThemeDebug;