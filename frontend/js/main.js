import { elements, showToast, hideResults, renderCascadingHTML, renderJSONVisuals, showResultsContainer, updateCounters, updateFileCounter } from './ui.js';
import { selectTool, getCurrentEndpoint } from './toolSelector.js';
import { processTextAPI, processTextAPIStream, scrapeUrlAPI } from './api.js';
import { translations, getLanguage } from './i18n.js';
import { generatePDFReport } from './pdfReport.js';

let isProcessing = false;
let rawMarkdownForDownload = ''; // لحفظ النتيجة كنص ليتم تصديرها

const urlParams = new URLSearchParams(window.location.search);
const toolFromUrl = urlParams.get('tool');
if (toolFromUrl) {
    selectTool(toolFromUrl);
} else {
    selectTool('summarize');
}

// دعم أزرار Back / Forward في المتصفح
window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const tool   = params.get('tool') || 'summarize';
    selectTool(tool);
});

elements.toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isProcessing) return;
        const endpoint = btn.getAttribute('data-endpoint');
        selectTool(endpoint);
        const newUrl = window.location.pathname + '?tool=' + endpoint;
        window.history.pushState({ path: newUrl }, '', newUrl);
        // عند التبديل إلى أداة غير وسائط — أعد العداد لعدد الكلمات
        if (endpoint !== 'audio-analysis') updateFileCounter(null);
    });
});

elements.newsInput.addEventListener('input', () => {
    updateCounters(elements.newsInput.value);
    updateReadingTime(elements.newsInput.value);
    scheduleAutoSave();
});

// ─── Auto-save المسودات في localStorage ─────────────────
const AUTOSAVE_KEY = 'prism_draft';
const autosaveEl   = document.getElementById('autosave-indicator');
let autosaveTimer;

const showSaved = () => {
    autosaveEl?.classList.add('visible');
    clearTimeout(showSaved._t);
    showSaved._t = setTimeout(() => autosaveEl?.classList.remove('visible'), 1500);
};

const scheduleAutoSave = () => {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
        const value = elements.newsInput.value;
        if (value.trim().length > 10) {
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
                text: value,
                tool: getCurrentEndpoint(),
                ts:   Date.now()
            }));
            showSaved();
        } else {
            localStorage.removeItem(AUTOSAVE_KEY);
        }
    }, 800);
};

// استرجاع المسودة عند فتح الصفحة (إذا أحدث من 24 ساعة)
const restoreDraft = () => {
    try {
        const raw = localStorage.getItem(AUTOSAVE_KEY);
        if (!raw) return;
        const draft = JSON.parse(raw);
        const ageHours = (Date.now() - draft.ts) / 36e5;
        if (ageHours > 24 || !draft.text) return;
        if (elements.newsInput.value.trim()) return;
        elements.newsInput.value = draft.text;
        updateCounters(draft.text);
        updateReadingTime(draft.text);
    } catch { /* ignore */ }
};
restoreDraft();

// ─── حساب وقت القراءة التقريبي (200 كلمة/دقيقة) ─────────
const readingTimeEl   = document.getElementById('reading-time');
const readingTimeText = document.getElementById('reading-time-text');
const updateReadingTime = (text) => {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
    if (!words) { readingTimeEl?.classList.add('hidden'); return; }
    const minutes = Math.max(1, Math.round(words / 200));
    if (readingTimeText) readingTimeText.textContent = `~${minutes} min`;
    readingTimeEl?.classList.remove('hidden');
};

// ─── زر مسح النص ─────────────────────────────────────────
const clearBtn = document.getElementById('clear-btn');
clearBtn?.addEventListener('click', () => {
    if (!elements.newsInput.value.trim()) return;
    if (!confirm('Clear all text?')) return;
    elements.newsInput.value = '';
    updateCounters('');
    updateReadingTime('');
    localStorage.removeItem(AUTOSAVE_KEY);
    elements.newsInput.focus();
});

// ─── اختصار Ctrl/Cmd + Enter لبدء التحليل ───────────────
elements.newsInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        elements.processBtn.click();
    }
});

// ─── زر العودة للأعلى ────────────────────────────────────
const scrollTopBtn = document.getElementById('scroll-top-btn');
const mainScroller = document.querySelector('main');
mainScroller?.addEventListener('scroll', () => {
    if (mainScroller.scrollTop > 400) scrollTopBtn?.classList.add('visible');
    else scrollTopBtn?.classList.remove('visible');
});
scrollTopBtn?.addEventListener('click', () => {
    mainScroller?.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── زر العرض الكامل للنتائج ─────────────────────────────
const fullscreenBtn = document.getElementById('fullscreen-btn');
fullscreenBtn?.addEventListener('click', () => {
    const el = elements.resultsContainer;
    if (!document.fullscreenElement) {
        el?.requestFullscreen?.().catch(() => {});
    } else {
        document.exitFullscreen?.();
    }
});

// متغير لحفظ الملف المرفوع
let currentMediaFile = null;

// أحداث رفع الملفات
elements.fileDropzone.addEventListener('click', () => elements.mediaInput.click());
elements.mediaInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        currentMediaFile = e.target.files[0];
        elements.fileNameDisplay.textContent = currentMediaFile.name;
        elements.fileNameDisplay.classList.remove('hidden');
        updateFileCounter(currentMediaFile); // عرض حجم الملف بالميغابايت
    }
});
elements.fileDropzone.addEventListener('dragover', (e) => { e.preventDefault(); elements.fileDropzone.classList.add('border-blue-500'); });
elements.fileDropzone.addEventListener('dragleave', (e) => { e.preventDefault(); elements.fileDropzone.classList.remove('border-blue-500'); });
elements.fileDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.fileDropzone.classList.remove('border-blue-500');
    if (e.dataTransfer.files.length > 0) {
        currentMediaFile = e.dataTransfer.files[0];
        elements.mediaInput.files = e.dataTransfer.files;
        elements.fileNameDisplay.textContent = currentMediaFile.name;
        elements.fileNameDisplay.classList.remove('hidden');
        updateFileCounter(currentMediaFile); // عرض حجم الملف بالميغابايت
    }
});

// أحداث جلب الرابط
elements.scrapeBtn.addEventListener('click', async () => {
    const url = elements.urlInput.value.trim();
    if (!url) return;
    
    elements.scrapeBtn.disabled = true;
    const oldHtml = elements.scrapeBtn.innerHTML;
    elements.scrapeBtn.innerHTML = '<span class="animate-pulse">...</span>';
    
    try {
        const res = await scrapeUrlAPI(url);
        elements.newsInput.value = res.text + "\n\n" + elements.newsInput.value;
        updateCounters(elements.newsInput.value);
        showToast('toast.scrape.success', 'success');
        elements.urlInput.value = '';
    } catch(err) {
        showToast('toast.scrape.fail', 'error');
    } finally {
        elements.scrapeBtn.disabled = false;
        elements.scrapeBtn.innerHTML = oldHtml;
    }
});

// دالة لتجميع الخيارات من الواجهة قبل الإرسال
const gatherToolOptions = () => {
    const options = {};
    const endpoint = getCurrentEndpoint();
    if (endpoint === 'summarize') {
        options.length = document.getElementById('opt-sum-length').value;
        options.quotes = document.getElementById('opt-sum-quotes').checked;
    } else if (endpoint === 'bias') {
        options.strictness = document.getElementById('opt-bias-strictness').value;
    } else if (endpoint === 'recycle') {
        const platformCheckboxes = document.querySelectorAll('.opt-rec-platform-cb:checked');
        options.platforms = Array.from(platformCheckboxes).map(cb => cb.value);
        if(options.platforms.length === 0) options.platforms = ['X (Twitter)'];
        options.tone = document.getElementById('opt-rec-tone').value;
        options.audience = document.getElementById('opt-rec-audience').value;
    } else if (endpoint === 'truth-guard') {
        options.checkType = document.getElementById('opt-truth-type').value;
    }
    return options;
};

elements.processBtn.addEventListener('click', async () => {
    const text = elements.newsInput.value.trim();
    const endpoint = getCurrentEndpoint();
    
    if (endpoint !== 'audio-analysis' && !text) {
        showToast('toast.empty', 'error');
        elements.newsInput.focus();
        return;
    }
    if (endpoint === 'audio-analysis' && !currentMediaFile) {
        showToast('toast.empty', 'error');
        return;
    }

    isProcessing = true;
    elements.processBtn.disabled = true;
    const originalBtnContent = elements.processBtn.innerHTML;
    
    const lang = getLanguage();
    elements.processBtn.innerHTML = `
        <svg class="animate-spin h-5 w-5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>${translations[lang]['editor.btn.processing']}</span>
    `;
    
    hideResults();
    setTimeout(() => elements.skeletonContainer.classList.remove('hidden'), 300);
    
    try {
        const options = gatherToolOptions();
        const STREAMING_ENDPOINTS = new Set(['summarize', 'recycle', 'synthesis', 'audio-analysis']);
        const useStream = STREAMING_ENDPOINTS.has(endpoint);

        if (useStream) {
            // ⚡ Streaming path: render chunks progressively
            // الـ skeleton يبقى ظاهراً حتى يصل أول chunk من الخادم
            let firstChunk = true;
            const responseData = await processTextAPIStream(
                endpoint, text, options, currentMediaFile,
                (fullText) => {
                    if (firstChunk) {
                        firstChunk = false;
                        elements.skeletonContainer.classList.add('hidden');
                        elements.resultsContent.innerHTML = '';
                        elements.resultsVisuals.innerHTML = '';
                        elements.resultsVisuals.classList.add('hidden');
                        showResultsContainer();
                        elements.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    elements.resultsContent.innerHTML = marked.parse(fullText);
                }
            );
            rawMarkdownForDownload = responseData.result;
        } else {
            // Non-streaming path (JSON: bias / truth-guard)
            const responseData = await processTextAPI(endpoint, text, options, currentMediaFile);
            elements.skeletonContainer.classList.add('hidden');

            if (responseData.type === 'markdown') {
                rawMarkdownForDownload = responseData.result;
                const htmlResult = marked.parse(responseData.result);
                await renderCascadingHTML(htmlResult);
            } else {
                rawMarkdownForDownload = JSON.stringify(responseData.result, null, 2);
                renderJSONVisuals(responseData.type, responseData.result);
            }
            elements.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        showToast('toast.success', 'success');
        localStorage.removeItem(AUTOSAVE_KEY);
        // إعادة جلب السجل ليظهر التقرير الجديد فوراً
        if (typeof window.__refreshHistory === 'function') window.__refreshHistory();

    } catch (error) {
        console.error('API Error:', error);
        elements.skeletonContainer.classList.add('hidden');
        showToast('toast.error', 'error');
    } finally {
        isProcessing = false;
        elements.processBtn.disabled = false;
        elements.processBtn.innerHTML = originalBtnContent;
    }
});

elements.copyBtn.addEventListener('click', async () => {
    if (!rawMarkdownForDownload) return;
    try {
        await navigator.clipboard.writeText(rawMarkdownForDownload);
        showToast('toast.copy.success', 'success');
    } catch (err) {
        showToast('toast.copy.fail', 'error');
    }
});

elements.downloadBtn.addEventListener('click', () => {
    if (!rawMarkdownForDownload) return;
    generatePDFReport();
});

export const loadReport = async (report) => {
    selectTool(report.endpoint);
    
    // وضع النص في المحرر (لو كان موجوداً)
    if (report.inputText && report.endpoint !== 'audioAnalysis') {
        elements.newsInput.value = report.inputText;
        updateCounters(report.inputText);
    }
    
    // استعادة حالة الأزرار والواجهة
    hideResults();
    setTimeout(async () => {
        elements.skeletonContainer.classList.add('hidden');
        if (report.endpoint === 'bias' || report.endpoint === 'truthGuard') {
            rawMarkdownForDownload = JSON.stringify(report.aiResult, null, 2);
            renderJSONVisuals(report.endpoint === 'bias' ? 'json_bias' : 'json_truth', report.aiResult);
        } else {
            rawMarkdownForDownload = report.aiResult;
            const htmlResult = marked.parse(report.aiResult);
            await renderCascadingHTML(htmlResult);
        }
        elements.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
};
