import { setLanguage, getLanguage, applyTranslations } from './i18n.js';

export function initSettings() {
    // Theme setup
    const savedTheme = localStorage.getItem('prism_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Language setup
    const savedLang = getLanguage();
    setLanguage(savedLang);

    // Attach to window for inline onclick usage
    window.toggleTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('prism_theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('prism_theme', 'dark');
        }
    };

    window.toggleLanguage = () => {
        const currentLang = getLanguage();
        setLanguage(currentLang === 'ar' ? 'en' : 'ar');
    };
    
    // Apply translations on initial load
    // Note: ES modules are deferred, so DOMContentLoaded has already fired
    // by the time this runs — call directly instead of adding a listener.
    applyTranslations(getLanguage());
}
