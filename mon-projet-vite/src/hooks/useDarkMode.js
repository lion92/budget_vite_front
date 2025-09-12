import { useState, useEffect, useCallback } from 'react';

export const useDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Fonction pour appliquer le thème
    const applyTheme = useCallback((darkMode) => {
        const root = document.documentElement;
        const body = document.body;

        // Nettoyer les classes/attributs existants
        root.removeAttribute('data-theme');
        body.classList.remove('dark-mode');

        if (darkMode) {
            root.setAttribute('data-theme', 'dark');
            body.classList.add('dark-mode');
        }

        // Sauvegarder la préférence
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        
        console.log('Theme applied:', darkMode ? 'dark' : 'light');
        console.log('HTML data-theme:', root.getAttribute('data-theme'));
        console.log('Body classes:', body.className);
    }, []);

    useEffect(() => {
        // Déterminer le thème initial
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        
        console.log('Initial theme detection:', {
            savedTheme,
            prefersDark,
            shouldBeDark
        });

        setIsDarkMode(shouldBeDark);
        applyTheme(shouldBeDark);
    }, [applyTheme]);

    const toggleTheme = useCallback(() => {
        const newDarkMode = !isDarkMode;
        console.log('Toggling theme from', isDarkMode ? 'dark' : 'light', 'to', newDarkMode ? 'dark' : 'light');
        setIsDarkMode(newDarkMode);
        applyTheme(newDarkMode);
    }, [isDarkMode, applyTheme]);

    return {
        isDarkMode,
        toggleTheme
    };
};