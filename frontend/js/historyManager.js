import { loadReport } from './main.js';
import { showToast } from './ui.js';
import { translations, getLanguage } from './i18n.js';

const historyList = document.getElementById('history-list');
const refreshBtn = document.getElementById('refresh-history-btn');

const toolNameKeys = {
    'summarize':     'tool.summarize.title',
    'bias':          'tool.bias.title',
    'recycle':       'tool.recycle.title',
    'truthGuard':    'tool.truth.title',
    'synthesis':     'nav.synthesis',
    'audioAnalysis': 'nav.audio'
};

const getToolName = (endpoint) => {
    const lang = getLanguage();
    const key = toolNameKeys[endpoint];
    return (key && translations[lang][key]) || endpoint;
};

const t = (key) => {
    const lang = getLanguage();
    return translations[lang][key] || key;
};

const toolColors = {
    'summarize': 'text-blue-500 bg-blue-500/10',
    'bias': 'text-purple-500 bg-purple-500/10',
    'recycle': 'text-green-500 bg-green-500/10',
    'truthGuard': 'text-red-500 bg-red-500/10',
    'synthesis': 'text-amber-500 bg-amber-500/10',
    'audioAnalysis': 'text-cyan-500 bg-cyan-500/10'
};

export const fetchAndRenderHistory = async () => {
    try {
        historyList.innerHTML = `<div class="text-center text-xs text-slate-400 py-4 animate-pulse">${t('history.loading')}</div>`;

        const response = await fetch('/api/history');
        const json = await response.json();

        if (!json.success) throw new Error('Failed to fetch');

        const reports = json.data;
        if (reports.length === 0) {
            historyList.innerHTML = `<div class="text-center text-xs text-slate-400 py-4">${t('history.empty')}</div>`;
            return;
        }

        const lang = getLanguage();
        historyList.innerHTML = '';
        reports.forEach(report => {
            const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
            const date = new Date(report.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            const item = document.createElement('div');
            item.className = 'group flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer shadow-sm';
            item.innerHTML = `
                <div class="flex flex-col gap-1 w-full overflow-hidden" onclick="window.loadHistoryReport('${report._id}')">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${toolColors[report.endpoint] || 'text-slate-500 bg-slate-100'} whitespace-nowrap">
                            ${getToolName(report.endpoint)}
                        </span>
                        <span class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">${date}</span>
                    </div>
                    <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate pr-1">
                        ${report.inputText ? report.inputText.substring(0, 40) + '...' : t('history.media')}
                    </p>
                </div>
                <button onclick="window.deleteHistoryReport('${report._id}')" class="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="${t('history.delete.title')}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            `;
            historyList.appendChild(item);
        });

        window.__PRISM_HISTORY__ = reports;

    } catch (err) {
        console.error('History Fetch Error:', err);
        historyList.innerHTML = `<div class="text-center text-xs text-red-400 py-4">${t('history.error')}</div>`;
    }
};

window.loadHistoryReport = (id) => {
    const report = window.__PRISM_HISTORY__.find(r => r._id === id);
    if (report) {
        loadReport(report);
        showToast('toast.history.loaded', 'success');
    }
};

window.deleteHistoryReport = async (id) => {
    if (!confirm(t('history.confirm.delete'))) return;

    try {
        const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            showToast('toast.history.deleted', 'success');
            fetchAndRenderHistory();
        } else {
            showToast('toast.history.delete.fail', 'error');
        }
    } catch (err) {
        showToast('toast.history.delete.fail', 'error');
    }
};

// تشغيل جلب البيانات عند التحميل وعند النقر على زر التحديث
refreshBtn.addEventListener('click', fetchAndRenderHistory);
document.addEventListener('DOMContentLoaded', fetchAndRenderHistory);
