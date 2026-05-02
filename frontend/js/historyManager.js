import { loadReport } from './main.js';
import { showToast } from './ui.js';
import { translations, getLanguage } from './i18n.js';

const historyList   = document.getElementById('history-list');
const refreshBtn    = document.getElementById('refresh-history-btn');
const searchInput   = document.getElementById('history-search');
const filtersBar    = document.getElementById('history-filters');

let allReports = [];
let activeFilter = 'all';
let activeQuery  = '';

const toolNameKeys = {
    'summarize':     'tool.summarize.title',
    'bias':          'tool.bias.title',
    'recycle':       'tool.recycle.title',
    'truthGuard':    'tool.truth.title',
    'synthesis':     'nav.synthesis',
    'audioAnalysis': 'nav.audio'
};

const toolColors = {
    'summarize':     'text-blue-500 bg-blue-500/10',
    'bias':          'text-purple-500 bg-purple-500/10',
    'recycle':       'text-green-500 bg-green-500/10',
    'truthGuard':    'text-red-500 bg-red-500/10',
    'synthesis':     'text-amber-500 bg-amber-500/10',
    'audioAnalysis': 'text-cyan-500 bg-cyan-500/10'
};

const getToolName = (endpoint) => {
    const lang = getLanguage();
    const key  = toolNameKeys[endpoint];
    return (key && translations[lang][key]) || endpoint;
};

const t = (key) => {
    const lang = getLanguage();
    return translations[lang][key] || key;
};

// ─── Filtering & rendering ───────────────────────────────
const applyFilters = (reports) => {
    let list = reports.slice();

    if (activeFilter === 'favorite') {
        list = list.filter(r => r.favorite);
    } else if (activeFilter !== 'all') {
        list = list.filter(r => r.endpoint === activeFilter);
    }

    if (activeQuery) {
        const q = activeQuery.toLowerCase();
        list = list.filter(r => {
            const haystack = [
                r.inputText || '',
                getToolName(r.endpoint),
                typeof r.aiResult === 'string' ? r.aiResult : JSON.stringify(r.aiResult)
            ].join(' ').toLowerCase();
            return haystack.includes(q);
        });
    }

    // Favorites always render first within the filtered list
    list.sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite));
    return list;
};

const renderList = () => {
    const reports = applyFilters(allReports);

    if (!reports.length) {
        historyList.innerHTML = `<div class="text-center text-xs text-slate-400 py-4">${
            activeQuery ? t('history.no.match') : t('history.empty')
        }</div>`;
        return;
    }

    const lang = getLanguage();
    historyList.innerHTML = '';

    reports.forEach(report => {
        const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
        const date   = new Date(report.createdAt).toLocaleDateString(locale, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const fav = report.favorite ? 'is-fav' : '';

        const item = document.createElement('div');
        item.className = 'group flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm gap-2';
        item.innerHTML = `
            <button class="fav-star ${fav} shrink-0 p-1" data-fav-id="${report._id}" title="${t('history.favorite')}">
                <svg class="w-4 h-4" fill="${report.favorite ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.098 10.1c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"/></svg>
            </button>
            <div class="flex flex-col gap-1 flex-1 min-w-0 cursor-pointer" data-load-id="${report._id}">
                <div class="flex items-center gap-2">
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${toolColors[report.endpoint] || 'text-slate-500 bg-slate-100'} whitespace-nowrap">
                        ${getToolName(report.endpoint)}
                    </span>
                    <span class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">${date}</span>
                </div>
                <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    ${report.inputText ? report.inputText.substring(0, 40) + '...' : t('history.media')}
                </p>
            </div>
            <button data-del-id="${report._id}" class="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="${t('history.delete.title')}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg>
            </button>
        `;
        historyList.appendChild(item);
    });

    window.__PRISM_HISTORY__ = allReports;
};

// ─── API calls ───────────────────────────────────────────
export const fetchAndRenderHistory = async () => {
    try {
        historyList.innerHTML = `<div class="text-center text-xs text-slate-400 py-4 animate-pulse">${t('history.loading')}</div>`;

        const response = await fetch('/api/history');
        const json     = await response.json();
        if (!json.success) throw new Error('Failed to fetch');

        allReports = json.data || [];
        renderList();
    } catch (err) {
        console.error('History Fetch Error:', err);
        historyList.innerHTML = `<div class="text-center text-xs text-red-400 py-4">${t('history.error')}</div>`;
    }
};

const toggleFavorite = async (id) => {
    try {
        const res  = await fetch(`/api/history/${id}/favorite`, { method: 'PATCH' });
        const json = await res.json();
        if (!json.success) throw new Error();

        const report = allReports.find(r => r._id === id);
        if (report) report.favorite = json.data.favorite;
        renderList();
    } catch {
        showToast('toast.history.delete.fail', 'error');
    }
};

const deleteReport = async (id) => {
    if (!confirm(t('history.confirm.delete'))) return;
    try {
        const res  = await fetch(`/api/history/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            allReports = allReports.filter(r => r._id !== id);
            renderList();
            showToast('toast.history.deleted', 'success');
        } else {
            showToast('toast.history.delete.fail', 'error');
        }
    } catch {
        showToast('toast.history.delete.fail', 'error');
    }
};

const loadReportById = (id) => {
    const report = allReports.find(r => r._id === id);
    if (report) {
        loadReport(report);
        showToast('toast.history.loaded', 'success');
    }
};

// ─── Event delegation on the list ────────────────────────
historyList?.addEventListener('click', (e) => {
    const favBtn = e.target.closest('[data-fav-id]');
    if (favBtn) { toggleFavorite(favBtn.dataset.favId); return; }

    const delBtn = e.target.closest('[data-del-id]');
    if (delBtn) { deleteReport(delBtn.dataset.delId); return; }

    const loadEl = e.target.closest('[data-load-id]');
    if (loadEl) { loadReportById(loadEl.dataset.loadId); }
});

// ─── Search & filter wiring ──────────────────────────────
let searchDebounce;
searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        activeQuery = e.target.value.trim();
        renderList();
    }, 150);
});

filtersBar?.addEventListener('click', (e) => {
    const chip = e.target.closest('.history-filter-chip');
    if (!chip) return;
    filtersBar.querySelectorAll('.history-filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    renderList();
});

refreshBtn?.addEventListener('click', fetchAndRenderHistory);

// تعريض دالة التحديث لـ main.js كي يستدعيها بعد كل تحليل ناجح
window.__refreshHistory = fetchAndRenderHistory;

// Modules are deferred — DOM is ready when this runs.
fetchAndRenderHistory();

// Re-render when language changes (so tool names refresh)
window.addEventListener('languagechange', renderList);

// Legacy global hooks (still used elsewhere)
window.loadHistoryReport   = loadReportById;
window.deleteHistoryReport = deleteReport;
