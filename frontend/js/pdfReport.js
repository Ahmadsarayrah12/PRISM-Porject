import { showToast } from './ui.js';

// ============================================================
//  PRISM — Report Engine  v3.0
//  Bilingual (Arabic / English) PDF generation system.
//  Full RTL support · Auto language detection · Scalable
// ============================================================


// ─── 1. I18N STRINGS ─────────────────────────────────────────
// All user-facing text in both languages. Add keys here as needed.
const I18N = {
  ar: {
    tagline:      'منصة الذكاء الإعلامي',
    defaultTool:  'تحليل إعلامي',
    footerText:   'تم إنشاء هذا التقرير آلياً بواسطة منصة PRISM · prism.media',
    toastMessage: '📄 جارٍ تجهيز التقرير …',
    dateLabel:    'التاريخ',
    timeLabel:    'الوقت',
  },
  en: {
    tagline:      'Media Intelligence Platform',
    defaultTool:  'Media Analysis',
    footerText:   'This report was generated automatically by PRISM · prism.media',
    toastMessage: '📄 Preparing report …',
    dateLabel:    'Date',
    timeLabel:    'Time',
  },
};

// ─── 2. CONFIGURATION ────────────────────────────────────────
// All tuneable values in one place — no magic strings elsewhere.
const REPORT_CONFIG = {
  brandName:    'PRISM',
  accentColor:  '#2563eb',
  dangerColor:  '#dc2626',
  warningColor: '#d97706',
  successColor: '#16a34a',
  // Arabic-first font stacks
  fontDisplayAr: "'Cairo', 'Tajawal', 'Segoe UI', sans-serif",
  fontBodyAr:    "'Noto Naskh Arabic', 'Amiri', 'Times New Roman', serif",
  // English font stacks
  fontDisplayEn: "'Montserrat', 'Segoe UI', sans-serif",
  fontBodyEn:    "'Georgia', 'Times New Roman', serif",
  pageMargin:   '18mm 15mm',
};


// ─── 3. LANGUAGE DETECTION ───────────────────────────────────

/**
 * Detects the active language from multiple sources, in priority order:
 *  1. Explicit [data-lang] attribute on <html> or <body>
 *  2. The lang="" attribute on <html>
 *  3. The dir="" attribute (rtl → ar)
 *  4. Character frequency analysis of #results-container text
 *  5. Falls back to 'en'
 *
 * @returns {'ar'|'en'}
 */
const detectLanguage = () => {
  // 1. Explicit data attribute
  const explicit =
    document.documentElement.dataset.lang ||
    document.body.dataset.lang;
  if (explicit) return explicit.startsWith('ar') ? 'ar' : 'en';

  // 2. lang attribute
  const lang = document.documentElement.lang;
  if (lang) return lang.startsWith('ar') ? 'ar' : 'en';

  // 3. dir attribute
  const dir = document.documentElement.dir || document.body.dir;
  if (dir === 'rtl') return 'ar';

  // 4. Character frequency analysis of the result content
  const text = document.getElementById('results-container')?.textContent ?? '';
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinChars  = (text.match(/[a-zA-Z]/g)        || []).length;
  if (arabicChars + latinChars > 0) {
    return arabicChars / (arabicChars + latinChars) > 0.35 ? 'ar' : 'en';
  }

  // 5. Default
  return 'en';
};


// ─── 4. METADATA BUILDER ─────────────────────────────────────

/**
 * Collects runtime metadata: language, direction, date, time, tool name.
 * @returns {{ lang, dir, isRtl, t, date, time, toolLabel }}
 */
const buildMeta = () => {
  const lang  = detectLanguage();
  const isRtl = lang === 'ar';
  const dir   = isRtl ? 'rtl' : 'ltr';
  const t     = I18N[lang];

  const locale = isRtl ? 'ar-SA' : 'en-GB';
  const now    = new Date();
  const date   = now.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
  const time   = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  const toolLabel =
    document.querySelector('[data-active-tool]')?.dataset.activeToolLabel ??
    document.querySelector('.tool-title, .analysis-title, h2')?.textContent?.trim() ??
    t.defaultTool;

  return { lang, dir, isRtl, t, date, time, toolLabel };
};


// ─── 5. PRINT STYLES ─────────────────────────────────────────

/**
 * Generates the full @media print stylesheet, fully language-aware.
 * @param {ReturnType<buildMeta>} meta
 */
const buildPrintStyles = (meta) => {
  const { dir, isRtl, t } = meta;

  const fontDisplay  = isRtl ? REPORT_CONFIG.fontDisplayAr : REPORT_CONFIG.fontDisplayEn;
  const fontBody     = isRtl ? REPORT_CONFIG.fontBodyAr    : REPORT_CONFIG.fontBodyEn;

  // Logical-direction shorthands — flipped for RTL
  const blockStart = isRtl ? 'right' : 'left';
  const blockEnd   = isRtl ? 'left'  : 'right';
  const metaAlign  = isRtl ? 'left'  : 'right';
  const brandAlign = isRtl ? 'right' : 'left';

  return /* css */ `

/* ── Google Fonts: Arabic ───────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700&family=Noto+Naskh+Arabic&display=swap');

/* ── Reset & page setup ─────────────────────────── */
@media print {

  @page {
    size: A4 portrait;
    margin: ${REPORT_CONFIG.pageMargin};
  }

  body * { visibility: hidden !important; }

  #results-container,
  #results-container * { visibility: visible !important; }

  #download-btn, #copy-btn, #share-btn,
  .no-print, [data-no-print] { display: none !important; }

/* ── Container reset ────────────────────────────── */
  #results-container {
    position:   absolute;
    inset:      0;
    width:      100%;
    margin:     0;
    padding:    0 0 20mm;
    background: #ffffff !important;
    color:      #0f172a !important;
    box-shadow: none !important;
    border:     none !important;
    font-family: ${fontBody};
    font-size:   11pt;
    line-height: ${isRtl ? '2' : '1.65'};
    direction:   ${dir};
    text-align:  ${blockStart};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

/* ── Top accent bar ─────────────────────────────── */
  #results-container::before {
    content: "";
    display: block;
    background:    ${REPORT_CONFIG.accentColor} !important;
    height:        6px;
    border-radius: 2px;
    margin-bottom: 14px;
  }

/* ── Injected header ────────────────────────────── */
  .prism-print-header {
    display:         flex !important;
    flex-direction:  ${isRtl ? 'row-reverse' : 'row'};
    align-items:     flex-start;
    justify-content: space-between;
    padding-bottom:  12px;
    margin-bottom:   22px;
    border-bottom:   1.5px solid #e2e8f0;
    page-break-inside: avoid;
    direction: ${dir};
  }

  .prism-print-header__brand {
    display:        flex;
    flex-direction: column;
    align-items:    flex-${isRtl ? 'end' : 'start'};
    text-align:     ${brandAlign};
  }

  .prism-print-header__logo {
    font-family:    ${fontDisplay};
    font-size:      22pt;
    font-weight:    900;
    letter-spacing: ${isRtl ? '0' : '-0.5px'};
    color:          ${REPORT_CONFIG.accentColor} !important;
    line-height:    1;
    direction:      ltr;   /* Logo always stays LTR */
  }

  .prism-print-header__tagline {
    font-family:    ${fontDisplay};
    font-size:      ${isRtl ? '9pt' : '8pt'};
    font-weight:    ${isRtl ? '600' : '500'};
    letter-spacing: ${isRtl ? '0' : '2px'};
    text-transform: ${isRtl ? 'none' : 'uppercase'};
    color:          #64748b !important;
    margin-top:     3px;
    direction:      ${dir};
  }

  .prism-print-header__meta {
    text-align:  ${metaAlign};
    font-family: ${fontDisplay};
    font-size:   ${isRtl ? '9pt' : '8pt'};
    color:       #64748b !important;
    line-height: 1.9;
    direction:   ${dir};
  }

  .prism-print-header__meta strong {
    display:       block;
    font-size:     10pt;
    font-weight:   700;
    color:         #0f172a !important;
    margin-bottom: 2px;
  }

/* ── Headings ───────────────────────────────────── */
  #results-container h1,
  #results-container h2,
  #results-container h3 {
    font-family:      ${fontDisplay} !important;
    color:            #0f172a !important;
    page-break-after: avoid;
    direction:        ${dir};
    text-align:       ${blockStart};
  }

  #results-container h1 { font-size: 16pt; margin-top: 18pt; }
  #results-container h2 {
    font-size: 13pt; margin-top: 14pt;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
  }
  #results-container h3 { font-size: 11pt; margin-top: 10pt; }

  #results-container p { margin: 6pt 0; direction: ${dir}; }

/* ── Links ──────────────────────────────────────── */
  #results-container a {
    color:           ${REPORT_CONFIG.accentColor} !important;
    text-decoration: underline;
    word-break:      break-all;
    direction:       ltr;       /* URLs are always LTR */
    unicode-bidi:    embed;
  }

  #results-container a[href]::after {
    content:      " (" attr(href) ")";
    font-size:    8pt;
    color:        #94a3b8 !important;
    direction:    ltr;
    unicode-bidi: embed;
  }

/* ── Lists ──────────────────────────────────────── */
  #results-container ul,
  #results-container ol {
    direction:          ${dir};
    padding-${blockStart}: 18pt;
    padding-${blockEnd}:   0;
    margin: 6pt 0;
  }

  #results-container li { margin-bottom: 3pt; }

/* ── Tables ─────────────────────────────────────── */
  #results-container table {
    width:           100%;
    border-collapse: collapse;
    margin:          10pt 0;
    font-size:       9.5pt;
    page-break-inside: auto;
    direction:       ${dir};
  }

  #results-container thead th {
    background:  ${REPORT_CONFIG.accentColor} !important;
    color:       #ffffff !important;
    font-family: ${fontDisplay};
    font-weight: 700;
    padding:     6pt 8pt;
    text-align:  ${blockStart};
  }

  #results-container tbody tr:nth-child(even) td {
    background: #f8fafc !important;
  }

  #results-container td {
    padding:        5pt 8pt;
    border-bottom:  0.5pt solid #e2e8f0;
    vertical-align: top;
    text-align:     ${blockStart};
  }

/* ── Code blocks ────────────────────────────────── */
  #results-container pre,
  #results-container code {
    font-family:   'Courier New', monospace;
    font-size:     8.5pt;
    background:    #f1f5f9 !important;
    color:         #1e293b !important;
    border:        0.5pt solid #cbd5e1;
    border-radius: 3pt;
    padding:       2pt 5pt;
    page-break-inside: avoid;
    direction:     ltr;       /* Code is always LTR */
    text-align:    left;
    unicode-bidi:  embed;
  }

  #results-container pre {
    padding:     8pt;
    overflow:    hidden;
    white-space: pre-wrap;
    word-break:  break-all;
  }

/* ── Blockquotes ────────────────────────────────── */
  #results-container blockquote {
    margin:              8pt 0;
    margin-${blockStart}: 12pt;
    padding:             6pt 12pt;
    border-${blockStart}: 3pt solid ${REPORT_CONFIG.accentColor};
    background:          #eff6ff !important;
    color:               #1e3a8a !important;
    font-style:          ${isRtl ? 'normal' : 'italic'};
    page-break-inside:   avoid;
    direction:           ${dir};
  }

/* ── Score / status chips ───────────────────────── */
  .prism-score-chip {
    display:       inline-block !important;
    padding:       2pt 8pt !important;
    border-radius: 99pt !important;
    font-family:   ${fontDisplay} !important;
    font-size:     9pt !important;
    font-weight:   700 !important;
  }

  .prism-score-chip.safe    { background: #dcfce7 !important; color: ${REPORT_CONFIG.successColor} !important; }
  .prism-score-chip.warning { background: #fef9c3 !important; color: ${REPORT_CONFIG.warningColor} !important; }
  .prism-score-chip.danger  { background: #fee2e2 !important; color: ${REPORT_CONFIG.dangerColor}  !important; }

/* ── Bias progress bar ──────────────────────────── */
  .prism-bias-bar-wrap 
  {
    background:    #e2e8f0 !important;
    border-radius: 99pt;
    height:        8pt;
    width:         100%;
    margin:        4pt 0 8pt;
    overflow:      hidden;
    direction:     ltr;  /* Progress bars are always LTR */
  }

  .prism-bias-bar-fill {
    height:        100%;
    border-radius: 99pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

/* ── Divider ────────────────────────────────────── */
  .prism-divider {
    border:     none;
    border-top: 0.75pt solid #e2e8f0;
    margin:     14pt 0;
  }

/* ── Footer ─────────────────────────────────────── */
  #results-container::after {
    content:     "${t.footerText}";
    display:     block;
    font-family: ${fontDisplay};
    font-size:   7.5pt;
    text-align:  center;
    color:       #94a3b8 !important;
    margin-top:  30pt;
    padding-top: 8pt;
    border-top:  0.75pt solid #e2e8f0;
    direction:   ${dir};
  }

/* ── Page-break utilities ───────────────────────── */
  .page-break-before { page-break-before: always; }
  .page-break-after  { page-break-after:  always; }
  .no-break          { page-break-inside: avoid;  }

} /* end @media print */
`;
};


// ─── 6. DOM HELPERS ──────────────────────────────────────────

/**
 * Injects the branded bilingual header into #results-container.
 * Date/time labels and visual order both flip automatically for Arabic.
 */
const injectPrintHeader = (meta) => {
  const container = document.getElementById('results-container');
  if (!container) return null;

  const { dir, isRtl, t, date, time, toolLabel } = meta;

  const dateTimeHtml = isRtl
    ? `${t.dateLabel}: ${date} &nbsp;·&nbsp; ${t.timeLabel}: ${time}`
    : `${date} &nbsp;·&nbsp; ${time}`;

  const header = document.createElement('div');
  header.className         = 'prism-print-header';
  header.dataset.printOnly = 'true';
  header.innerHTML = /* html */ `
    <div class="prism-print-header__brand">
      <span class="prism-print-header__logo">${REPORT_CONFIG.brandName}</span>
      <span class="prism-print-header__tagline">${t.tagline}</span>
    </div>
    <div class="prism-print-header__meta">
      <strong>${toolLabel}</strong>
      ${dateTimeHtml}
    </div>
  `;

  container.insertBefore(header, container.firstChild);
  return header;
};

/**
 * Applies the correct dir + lang attributes to #results-container
 * so the browser's print engine renders text in the right direction.
 * Returns the previous values for clean-up.
 */
const applyContainerDirection = (meta) => {
  const el = document.getElementById('results-container');
  if (!el) return null;

  const prev = { dir: el.dir, lang: el.lang };
  el.dir  = meta.dir;
  el.lang = meta.lang;
  return prev;
};


// ─── 7. PUBLIC API ────────────────────────────────────────────

/**
 * generatePDFReport()
 *
 * Auto-detects the report language (Arabic / English), applies the
 * matching RTL/LTR layout, injects a branded bilingual header, then
 * opens the native print dialog.  Cleans up completely afterward.
 *
 * @param {object}  [opts]
 * @param {'ar'|'en'} [opts.lang]        - Force a language (skips auto-detect).
 * @param {string}  [opts.toastMessage]  - Override the loading toast text.
 * @param {number}  [opts.delay=300]     - Ms before window.print() fires.
 * @returns {Promise<void>}              - Resolves after clean-up.
 *
 * @example
 * // Auto-detect:
 * await generatePDFReport();
 *
 * // Force Arabic:
 * await generatePDFReport({ lang: 'ar' });
 *
 * // Force English with a custom toast:
 * await generatePDFReport({ lang: 'en', toastMessage: 'Building report…' });
 */
export const generatePDFReport = (opts = {}) => {
  const { lang: forceLang, delay = 300 } = opts;

  return new Promise((resolve) => {

    // ① Build metadata (language, direction, date, labels …)
    const meta = buildMeta();

    // Override language if explicitly requested
    if (forceLang && I18N[forceLang]) {
      meta.lang  = forceLang;
      meta.isRtl = forceLang === 'ar';
      meta.dir   = meta.isRtl ? 'rtl' : 'ltr';
      meta.t     = I18N[forceLang];
    }

    const toastMessage = opts.toastMessage ?? meta.t.toastMessage;

    // ② Inject print stylesheet
    const styleEl = document.createElement('style');
    styleEl.id        = 'prism-print-styles';
    styleEl.innerHTML = buildPrintStyles(meta);
    document.head.appendChild(styleEl);

    // ③ Inject branded header node
    const headerEl = injectPrintHeader(meta);

    // ④ Apply direction to the container element
    const prevDir = applyContainerDirection(meta);

    // ⑤ Temporarily disable dark mode
    const wasDark = document.documentElement.classList.contains('dark');
    if (wasDark) document.documentElement.classList.remove('dark');

    // ⑥ Notify the user
    showToast(toastMessage, 'success');

    // ⑦ Open print dialog after a short render delay
    setTimeout(() => {
      window.print();

      // ⑧ Clean-up — restore everything exactly as it was
      styleEl.remove();
      headerEl?.remove();

      if (prevDir) {
        const el = document.getElementById('results-container');
        if (el) { el.dir = prevDir.dir; el.lang = prevDir.lang; }
      }

      if (wasDark) document.documentElement.classList.add('dark');

      resolve();
    }, delay);
  });
};