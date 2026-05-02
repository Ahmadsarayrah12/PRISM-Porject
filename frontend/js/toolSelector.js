import { elements, hideResults } from './ui.js';

export let currentEndpoint = 'summarize';

export const getCurrentEndpoint = () => currentEndpoint;

export const selectTool = (endpoint) => {
    elements.toolBtns.forEach(btn => {
        if(btn.getAttribute('data-endpoint') === endpoint) {
            btn.classList.add('active');
            currentEndpoint = endpoint;
        } else {
            btn.classList.remove('active');
        }
    });

    // إعادة تطبيق الترجمات لتحديث العنوان والـ placeholder بناءً على الأداة النشطة
    import('./i18n.js').then(module => {
        module.applyTranslations(module.getLanguage());
    });

    elements.optionsContainers.forEach(container => {
        container.classList.add('hidden');
        container.classList.remove('flex');
    });
    
    const targetOpts = document.getElementById(`opts-${endpoint}`);
    if (targetOpts) {
        targetOpts.classList.remove('hidden');
        targetOpts.classList.add('flex');
    }

    if (endpoint === 'audio-analysis') {
        elements.newsInput.classList.add('hidden');
        elements.urlScraperBar.classList.add('hidden');
        elements.fileDropzone.classList.remove('hidden');
        elements.fileDropzone.classList.add('flex');
    } else {
        elements.newsInput.classList.remove('hidden');
        elements.urlScraperBar.classList.remove('hidden');
        elements.urlScraperBar.classList.add('flex');
        elements.fileDropzone.classList.add('hidden');
        elements.fileDropzone.classList.remove('flex');
    }

    hideResults();
};
