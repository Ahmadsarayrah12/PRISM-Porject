import { translations, getLanguage } from './i18n.js';

export const elements = {
    toolBtns:          document.querySelectorAll('.tool-btn'),
    currentToolTitle:  document.getElementById('current-tool-title'),
    newsInput:         document.getElementById('news-input'),
    processBtn:        document.getElementById('process-btn'),
    wordCount:         document.getElementById('word-count'),
    wordCountLabel:    document.querySelector('[data-i18n="editor.wordcount"]'),
    skeletonContainer: document.getElementById('skeleton-container'),
    resultsContainer:  document.getElementById('results-container'),
    resultsVisuals:    document.getElementById('results-visuals'),
    resultsContent:    document.getElementById('results-content'),
    copyBtn:           document.getElementById('copy-btn'),
    downloadBtn:       document.getElementById('download-btn'),
    toastContainer:    document.getElementById('toast-container'),
    optionsContainers: document.querySelectorAll('.tool-options'),
    urlScraperBar:     document.getElementById('url-scraper-bar'),
    urlInput:          document.getElementById('url-input'),
    scrapeBtn:         document.getElementById('scrape-btn'),
    fileDropzone:      document.getElementById('file-dropzone'),
    mediaInput:        document.getElementById('media-input'),
    fileNameDisplay:   document.getElementById('file-name-display'),
};

export const showToast = (messageKey, type = 'success') => {
    const lang = getLanguage();
    const message = translations[lang][messageKey] || messageKey;
    const toast = document.createElement('div');
    const borderColor = type === 'success' ? 'border-green-500' : (type === 'error' ? 'border-red-500' : 'border-slate-300 dark:border-slate-700');
    const textColor = type === 'success' ? 'text-green-700 dark:text-green-400' : (type === 'error' ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-200');
    const bgColor = 'bg-white dark:bg-slate-900';
    
    toast.className = `toast-enter flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl ${bgColor} border ${borderColor} text-sm font-bold ${textColor}`;
    toast.innerHTML = `<span>${message}</span>`;
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

export const hideResults = () => {
    elements.resultsContainer.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        elements.resultsContainer.classList.add('hidden');
        elements.resultsContent.innerHTML = '';
        elements.resultsVisuals.innerHTML = '';
        elements.resultsVisuals.classList.add('hidden');
    }, 300);
};

export const showResultsContainer = () => {
    elements.resultsContainer.classList.remove('hidden');
    void elements.resultsContainer.offsetWidth; 
    elements.resultsContainer.classList.remove('opacity-0', 'scale-95');
    elements.resultsContainer.classList.add('opacity-100', 'scale-100');
};

export const renderCascadingHTML = async (html) => {
    elements.resultsContent.innerHTML = html;
    showResultsContainer();

    const children = Array.from(elements.resultsContent.children);
    children.forEach(child => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(10px)';
        child.style.transition = 'all 0.4s ease-out';
    });

    for(let i=0; i<children.length; i++){
        await new Promise(r => setTimeout(r, 60));
        children[i].style.opacity = '1';
        children[i].style.transform = 'translateY(0)';
    }
};

export const renderJSONVisuals = (type, data) => {
    elements.resultsVisuals.classList.remove('hidden');
    const lang = getLanguage();
    const dict = translations[lang];
    
    if (type === 'json_bias') {
        const score = data.biasScore || 0;
        const rotation = (score / 100) * 180 - 90; 
        
        const wordsHtml = (data.biasedWords || []).map(w => `<span class="inline-block bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded text-xs border border-red-200 dark:border-red-500/20 m-1">${w}</span>`).join('');

        elements.resultsVisuals.innerHTML = `
            <div class="flex items-start gap-8 bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex flex-col items-center">
                    <div class="gauge-wrapper">
                        <div class="gauge-fill" style="transform: rotate(${rotation}deg);"></div>
                        <div class="gauge-cover flex items-end justify-center pb-1"><span class="text-xl font-bold text-slate-900 dark:text-white">${score}%</span></div>
                    </div>
                    <span class="text-slate-500 text-xs mt-2 font-bold uppercase tracking-wider">${dict['bias.index']}</span>
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-bold text-slate-900 dark:text-slate-200 mb-2">${dict['bias.detected.terms']}</h4>
                    <div class="mb-4">${wordsHtml || `<span class="text-slate-400 text-sm">${dict['bias.none.detected']}</span>`}</div>
                    <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 border-slate-200 dark:border-slate-700 pl-3">${data.analysis}</p>
                </div>
            </div>
        `;

        elements.resultsContent.innerHTML = `<div class="mt-6"><h3 class="text-sm font-bold text-slate-900 dark:text-white mb-2">${dict['bias.neutral.rewrite']}</h3><p class="text-slate-600 dark:text-slate-400">${data.neutralRewrite}</p></div>`;
        showResultsContainer();
    }
    
    if (type === 'json_truth') {
        const statusMap = {
            safe: { label: dict['status.safe'], border: 'border-green-200 dark:border-green-500/30', bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400' },
            warning: { label: dict['status.warning'], border: 'border-yellow-200 dark:border-yellow-500/30', bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400' },
            danger: { label: dict['status.danger'], border: 'border-red-200 dark:border-red-500/30', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400' }
        };
        const key = data.status === 'safe' ? 'safe' : (data.status === 'warning' ? 'warning' : 'danger');
        const style = statusMap[key];
        
        const fallaciesHtml = (data.fallacies || []).map(f => `<li class="text-sm mb-1">${f}</li>`).join('');
        const questionsHtml = (data.questionsForSource || []).map(q => `<li class="text-sm mb-1">${q}</li>`).join('');

        elements.resultsVisuals.innerHTML = `
            <div class="flex items-center gap-4 p-4 rounded-xl border ${style.border} ${style.bg} mb-6 shadow-sm">
                <div>
                    <h4 class="text-lg font-bold ${style.text}">${style.label}</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">${dict['credibility']}: ${data.credibilityScore}%</p>
                </div>
            </div>
        `;
        
        elements.resultsContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div class="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 class="text-slate-900 dark:text-slate-200 font-bold mt-0 text-sm mb-3">Detected Fallacies</h3>
                    <ul class="text-slate-600 dark:text-slate-400 m-0 pl-4 rtl:pr-4 ltr:pl-4">${fallaciesHtml}</ul>
                </div>
                <div class="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 class="text-slate-900 dark:text-slate-200 font-bold mt-0 text-sm mb-3">Investigation Prompts</h3>
                    <ul class="text-slate-600 dark:text-slate-400 m-0 pl-4 rtl:pr-4 ltr:pl-4">${questionsHtml}</ul>
                </div>
            </div>
            <div class="mt-4 bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 class="text-slate-900 dark:text-slate-200 font-bold mt-0 text-sm mb-2">Recommendations</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 m-0">${data.recommendations}</p>
            </div>
        `;
        showResultsContainer();
    }
};

/** يُحدِّث العداد بعدد الكلمات (وضع النص). */
export const updateCounters = (text) => {
    const count = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    elements.wordCount.textContent = count;
    if (elements.wordCountLabel) {
        const lang = getLanguage();
        elements.wordCountLabel.textContent = lang === 'ar' ? 'كلمة' : 'words';
    }
};

/**
 * يُحدِّث العداد بحجم الملف (وضع الوسائط).
 * إذا مررت null يعود للحالة الافتراضية.
 * @param {File|null} file
 */
export const updateFileCounter = (file) => {
    if (!file) {
        elements.wordCount.textContent = '0';
        if (elements.wordCountLabel) {
            const lang = getLanguage();
            elements.wordCountLabel.textContent = lang === 'ar' ? 'كلمة' : 'words';
        }
        return;
    }
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    elements.wordCount.textContent = sizeMB;
    if (elements.wordCountLabel) elements.wordCountLabel.textContent = 'MB';
};
