/**
 * ============================================================================
 * CAFE TEMPLATE - DARK MODE
 * ============================================================================
 * Dark mode toggle functionality with localStorage persistence
 * ThemeForest Standard: Premium Cafe & Restaurant Template
 * ============================================================================
 */

(function() {
    'use strict';

    // =============================================================================
    // CONFIGURATION
    // =============================================================================
    const STORAGE_KEY = 'cafe-theme-preference';
    const THEME_ATTRIBUTE = 'data-theme';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';

    // =============================================================================
    // DOM READY
    // =============================================================================
    document.addEventListener('DOMContentLoaded', function() {
        initDarkMode();
    });

    // =============================================================================
    // INITIALIZE DARK MODE
    // =============================================================================
    function initDarkMode() {
        const toggle = document.querySelector('.dark-mode-toggle');
        if (!toggle) return;

        // Apply saved theme or detect system preference
        const savedTheme = getStoredTheme();
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemPrefersDark ? DARK_THEME : LIGHT_THEME);
        
        applyTheme(initialTheme);

        // Toggle click handler
        toggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute(THEME_ATTRIBUTE);
            const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
            
            applyTheme(newTheme);
            storeTheme(newTheme);
            
            // Dispatch custom event for other scripts
            window.dispatchEvent(new CustomEvent('themechange', {
                detail: { theme: newTheme }
            }));
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // Only auto-switch if user hasn't manually set a preference
            if (!getStoredTheme()) {
                const newTheme = e.matches ? DARK_THEME : LIGHT_THEME;
                applyTheme(newTheme);
            }
        });
    }

    // =============================================================================
    // APPLY THEME
    // =============================================================================
    function applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === DARK_THEME) {
            html.setAttribute(THEME_ATTRIBUTE, DARK_THEME);
        } else {
            html.removeAttribute(THEME_ATTRIBUTE);
        }

        // Update meta theme-color for mobile browsers
        updateMetaThemeColor(theme);
    }

    // =============================================================================
    // STORE THEME PREFERENCE
    // =============================================================================
    function storeTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            console.warn('Unable to store theme preference:', e);
        }
    }

    // =============================================================================
    // GET STORED THEME
    // =============================================================================
    function getStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Unable to retrieve theme preference:', e);
            return null;
        }
    }

    // =============================================================================
    // UPDATE META THEME COLOR
    // =============================================================================
    function updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) return;

        const colors = {
            dark: '#1A1A1A',
            light: '#FFFFFF'
        };

        metaThemeColor.setAttribute('content', colors[theme] || colors.light);
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================
    window.DarkMode = {
        getCurrentTheme: function() {
            return document.documentElement.getAttribute(THEME_ATTRIBUTE) || LIGHT_THEME;
        },
        setTheme: function(theme) {
            applyTheme(theme);
            storeTheme(theme);
        },
        toggle: function() {
            const currentTheme = this.getCurrentTheme();
            const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
            this.setTheme(newTheme);
            return newTheme;
        }
    };

})();
