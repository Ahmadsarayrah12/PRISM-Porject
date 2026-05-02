import { showToast } from './ui.js';

// ============================================================
//  PRISM — Report Engine  v4.0
//  Bilingual (Arabic / English) · True A4 flex layout
//  Full RTL support · Auto language detection · Scalable
// ============================================================


// ─── 1. I18N STRINGS ─────────────────────────────────────────
const I18N = {
  ar: {
    tagline:      'منصة الذكاء الإعلامي',
    defaultTool:  'تحليل إعلامي',
    footerText:   'تم إنشاء هذا التقرير آلياً بواسطة منصة PRISM · prism.media',
    toastMessage: '📄 جارٍ تجهيز التقرير …',
    dateLabel:    'التاريخ',
    timeLabel:    'الوقت',
    pageLabel:    'صفحة',
    confidential: 'سري',
  },
  en: {
    tagline:      'Media Intelligence Platform',
    defaultTool:  'Media Analysis',
    footerText:   'Generated automatically by PRISM · prism.media',
    toastMessage: '📄 Preparing report …',
    dateLabel:    'Date',
    timeLabel:    'Time',
    pageLabel:    'Page',
    confidential: 'CONFIDENTIAL',
  },
};

// ─── 2. CONFIGURATION ────────────────────────────────────────
const REPORT_CONFIG = {
  brandName:    'PRISM',
  accentColor:  '#2563eb',
  dangerColor:  '#dc2626',
  warningColor: '#d97706',
  successColor: '#16a34a',
  fontDisplayAr: "'Cairo', 'Tajawal', 'Segoe UI', sans-serif",
  fontBodyAr:    "'Cairo', 'Tajawal', 'Segoe UI', sans-serif",
  fontDisplayEn: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  fontBodyEn:    "'Georgia', 'Times New Roman', serif",
  // A4 at 96dpi = 794px wide, 1123px tall
  // Margins: top/bottom 15mm, left/right 15mm
  pageMarginH:  '15mm',
  pageMarginV:  '15mm',
};


// ─── 3. LANGUAGE DETECTION ───────────────────────────────────
const detectLanguage = () => {
  const explicit = document.documentElement.dataset.lang || document.body.dataset.lang;
  if (explicit) return explicit.startsWith('ar') ? 'ar' : 'en';

  const lang = document.documentElement.lang;
  if (lang) return lang.startsWith('ar') ? 'ar' : 'en';

  const dir = document.documentElement.dir || document.body.dir;
  if (dir === 'rtl') return 'ar';

  const text = document.getElementById('results-container')?.textContent ?? '';
  const arabicChars = (text.match(/[؀-ۿ]/g) || []).length;
  const latinChars  = (text.match(/[a-zA-Z]/g)        || []).length;
  if (arabicChars + latinChars > 0) {
    return arabicChars / (arabicChars + latinChars) > 0.35 ? 'ar' : 'en';
  }
  return 'en';
};


// ─── 4. METADATA BUILDER ─────────────────────────────────────
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
const buildPrintStyles = (meta) => {
  const { dir, isRtl, t } = meta;

  const fontDisplay = isRtl ? REPORT_CONFIG.fontDisplayAr : REPORT_CONFIG.fontDisplayEn;
  const fontBody    = isRtl ? REPORT_CONFIG.fontBodyAr    : REPORT_CONFIG.fontBodyEn;

  const blockStart = isRtl ? 'right' : 'left';
  const blockEnd   = isRtl ? 'left'  : 'right';
  const metaAlign  = isRtl ? 'left'  : 'right';
  const brandAlign = isRtl ? 'right' : 'left';

  return /* css */ `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;900&family=Tajawal:wght@400;500;700&display=swap');

/* ══════════════════════════════════════════════════
   PRISM PRINT STYLES v4.1  —  Multi-page A4 flex
   ══════════════════════════════════════════════════ */

/* Hide the print wrapper on screen — it's only for the print pass */
#print-wrapper { display: none; }

@media print {

  /* ── Page geometry with running page numbers ────── */
  @page {
    size: A4 portrait;
    margin: ${REPORT_CONFIG.pageMarginV} ${REPORT_CONFIG.pageMarginH};

    @bottom-${blockEnd} {
      content: counter(page) " / " counter(pages);
      font-family: ${fontDisplay};
      font-size: 8pt;
      color: #94a3b8;
    }

    @bottom-${blockStart} {
      content: "${REPORT_CONFIG.brandName}";
      font-family: ${fontDisplay};
      font-size: 8pt;
      font-weight: 700;
      color: ${REPORT_CONFIG.accentColor};
      letter-spacing: 1pt;
    }
  }

  @page :first { margin-top: ${REPORT_CONFIG.pageMarginV}; }

  /* ── Hide everything except the print wrapper ──── */
  /* Use display:none on body's direct children so layout reflows
     and the print wrapper is the only element painted. This lets
     the browser paginate the content naturally across pages. */
  body > *:not(#print-wrapper) { display: none !important; }

  #download-btn, #copy-btn, #share-btn, #fullscreen-btn,
  .no-print, [data-no-print],
  .toast-container, [role="dialog"] {
    display: none !important;
  }

  html, body {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    overflow: visible !important;
  }

  /* ── Wrapper: normal flow, lets content paginate ── */
  #print-wrapper {
    display: block !important;
    position: static !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    inset: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    overflow: visible !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Inner page: natural flow, no height constraint */
  #print-page {
    display: block;
    width: 100%;
    height: auto;
    min-height: 0;
    font-family: ${fontBody};
    font-size: 10.5pt;
    line-height: ${isRtl ? '1.9' : '1.65'};
    color: #0f172a !important;
    direction: ${dir};
    text-align: ${blockStart};
    background: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Top accent bar (first page only) ───────────── */
  #print-page::before {
    content: "";
    display: block;
    width: 100%;
    height: 4pt;
    background: linear-gradient(90deg, ${REPORT_CONFIG.accentColor}, #7c3aed) !important;
    border-radius: 2pt;
    margin-bottom: 10pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Branded header ─────────────────────────────── */
  .prism-print-header {
    display: flex !important;
    flex-direction: ${isRtl ? 'row-reverse' : 'row'};
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 10pt;
    margin-bottom: 18pt;
    border-bottom: 1.5pt solid #e2e8f0;
    page-break-inside: avoid;
    break-inside: avoid;
    direction: ${dir};
  }

  .prism-print-header__brand {
    display: flex;
    flex-direction: column;
    align-items: flex-${isRtl ? 'end' : 'start'};
    gap: 2pt;
  }

  .prism-print-header__logo {
    font-family: ${fontDisplay};
    font-size: 20pt;
    font-weight: 900;
    letter-spacing: ${isRtl ? '0' : '-0.5px'};
    color: ${REPORT_CONFIG.accentColor} !important;
    line-height: 1;
    direction: ltr;
  }

  .prism-print-header__tagline {
    font-family: ${fontDisplay};
    font-size: ${isRtl ? '8.5pt' : '7.5pt'};
    font-weight: ${isRtl ? '600' : '500'};
    letter-spacing: ${isRtl ? '0' : '1.5px'};
    text-transform: ${isRtl ? 'none' : 'uppercase'};
    color: #64748b !important;
    direction: ${dir};
  }

  .prism-print-header__meta {
    text-align: ${metaAlign};
    font-family: ${fontDisplay};
    font-size: ${isRtl ? '9pt' : '8pt'};
    color: #475569 !important;
    line-height: 1.8;
    direction: ${dir};
  }

  .prism-print-header__meta strong {
    display: block;
    font-size: 10pt;
    font-weight: 700;
    color: #0f172a !important;
    margin-bottom: 3pt;
  }

  /* ── Content area ───────────────────────────────── */
  #print-content {
    display: block;
    width: 100%;
  }

  /* ── Headings ───────────────────────────────────── */
  #print-content h1,
  #print-content h2,
  #print-content h3,
  #print-content h4 {
    font-family: ${fontDisplay} !important;
    color: #0f172a !important;
    page-break-after: avoid;
    break-after: avoid;
    direction: ${dir};
    text-align: ${blockStart};
    margin-top: 0;
  }

  #print-content h1 {
    font-size: 15pt;
    font-weight: 800;
    margin-bottom: 10pt;
    padding-bottom: 6pt;
    border-bottom: 2pt solid ${REPORT_CONFIG.accentColor};
  }

  #print-content h2 {
    font-size: 12.5pt;
    font-weight: 700;
    margin-bottom: 8pt;
    padding-bottom: 4pt;
    border-bottom: 1pt solid #e2e8f0;
    color: #1e3a8a !important;
  }

  #print-content h3 {
    font-size: 11pt;
    font-weight: 700;
    margin-bottom: 6pt;
    color: #1e40af !important;
  }

  #print-content h4 {
    font-size: 10pt;
    font-weight: 600;
    margin-bottom: 4pt;
  }

  #print-content p {
    margin: 0 0 8pt;
    direction: ${dir};
    orphans: 3;
    widows: 3;
  }

  /* ── Links ──────────────────────────────────────── */
  #print-content a {
    color: ${REPORT_CONFIG.accentColor} !important;
    text-decoration: underline;
    word-break: break-all;
    direction: ltr;
    unicode-bidi: embed;
  }

  #print-content a[href]::after {
    content: " (" attr(href) ")";
    font-size: 7.5pt;
    color: #94a3b8 !important;
    direction: ltr;
    unicode-bidi: embed;
  }

  /* ── Lists ──────────────────────────────────────── */
  #print-content ul,
  #print-content ol {
    direction: ${dir};
    padding-${blockStart}: 16pt;
    padding-${blockEnd}: 0;
    margin: 0 0 8pt;
  }

  #print-content li {
    margin-bottom: 3pt;
    line-height: ${isRtl ? '1.9' : '1.65'};
  }

  #print-content li > ul,
  #print-content li > ol {
    margin-top: 3pt;
    margin-bottom: 3pt;
  }

  /* ── Tables ─────────────────────────────────────── */
  #print-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 8pt 0 12pt;
    font-size: 9pt;
    page-break-inside: auto;
    break-inside: auto;
    direction: ${dir};
  }

  #print-content thead {
    display: table-header-group;
  }

  #print-content thead th {
    background: ${REPORT_CONFIG.accentColor} !important;
    color: #ffffff !important;
    font-family: ${fontDisplay};
    font-size: 9pt;
    font-weight: 700;
    padding: 6pt 8pt;
    text-align: ${blockStart};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #print-content tbody tr:nth-child(even) td {
    background: #f8fafc !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #print-content td {
    padding: 5pt 8pt;
    border-bottom: 0.5pt solid #e2e8f0;
    vertical-align: top;
    text-align: ${blockStart};
  }

  #print-content tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* ── Code blocks ────────────────────────────────── */
  #print-content pre,
  #print-content code {
    font-family: 'Courier New', 'Consolas', monospace;
    font-size: 8.5pt;
    background: #f1f5f9 !important;
    color: #1e293b !important;
    border: 0.5pt solid #cbd5e1;
    border-radius: 3pt;
    padding: 2pt 5pt;
    page-break-inside: avoid;
    break-inside: avoid;
    direction: ltr;
    text-align: left;
    unicode-bidi: embed;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #print-content pre {
    padding: 8pt;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
  }

  /* ── Blockquotes ────────────────────────────────── */
  #print-content blockquote {
    margin: 0 0 10pt;
    margin-${blockStart}: 12pt;
    padding: 7pt 12pt;
    border-${blockStart}: 3pt solid ${REPORT_CONFIG.accentColor};
    background: #eff6ff !important;
    color: #1e3a8a !important;
    font-style: ${isRtl ? 'normal' : 'italic'};
    page-break-inside: avoid;
    break-inside: avoid;
    direction: ${dir};
    border-radius: 0 3pt 3pt 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Score / status chips ───────────────────────── */
  .prism-score-chip {
    display: inline-block !important;
    padding: 2pt 8pt !important;
    border-radius: 99pt !important;
    font-family: ${fontDisplay} !important;
    font-size: 8.5pt !important;
    font-weight: 700 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .prism-score-chip.safe    { background: #dcfce7 !important; color: ${REPORT_CONFIG.successColor} !important; }
  .prism-score-chip.warning { background: #fef9c3 !important; color: ${REPORT_CONFIG.warningColor} !important; }
  .prism-score-chip.danger  { background: #fee2e2 !important; color: ${REPORT_CONFIG.dangerColor}  !important; }

  /* ── Word chips (Bias detected terms) ──────────── */
  .prism-word-chip {
    display: inline-block !important;
    padding: 2pt 7pt !important;
    margin: 1pt 2pt !important;
    border-radius: 4pt !important;
    background: #fee2e2 !important;
    color: ${REPORT_CONFIG.dangerColor} !important;
    border: 0.5pt solid #fecaca !important;
    font-size: 8.5pt !important;
    font-weight: 600 !important;
    direction: ${dir};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── KPI block (bias score / credibility) ──────── */
  .prism-kpi {
    display: flex !important;
    align-items: center;
    justify-content: space-between;
    gap: 12pt;
    background: #f8fafc !important;
    border: 0.75pt solid #e2e8f0;
    border-radius: 6pt;
    padding: 12pt 14pt;
    margin: 0 0 14pt;
    page-break-inside: avoid;
    break-inside: avoid;
    direction: ${dir};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .prism-kpi__label {
    font-family: ${fontDisplay};
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1pt;
    color: #64748b !important;
    margin-bottom: 2pt;
  }
  .prism-kpi__value {
    font-family: ${fontDisplay};
    font-size: 22pt;
    font-weight: 900;
    line-height: 1;
    color: #0f172a !important;
  }
  .prism-kpi__bar {
    flex: 1;
    height: 10pt;
    border-radius: 99pt;
    background: linear-gradient(to right, #22c55e 0%, #eab308 50%, #ef4444 100%) !important;
    position: relative;
    overflow: visible;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .prism-kpi__marker {
    position: absolute;
    top: -3pt;
    width: 3pt;
    height: 16pt;
    background: #0f172a !important;
    border-radius: 1pt;
    transform: translateX(-50%);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Status banner (Truth Guard) ────────────────── */
  .prism-status-banner {
    display: flex !important;
    align-items: center;
    gap: 10pt;
    padding: 10pt 14pt;
    border-radius: 6pt;
    border: 1pt solid;
    margin: 0 0 14pt;
    page-break-inside: avoid;
    break-inside: avoid;
    direction: ${dir};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .prism-status-banner__icon {
    width: 22pt; height: 22pt;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13pt;
    font-weight: 900;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .prism-status-banner__label {
    font-family: ${fontDisplay};
    font-size: 13pt;
    font-weight: 800;
    line-height: 1.1;
  }
  .prism-status-banner__sub {
    font-family: ${fontDisplay};
    font-size: 8.5pt;
    color: #64748b !important;
    margin-top: 2pt;
  }
  .prism-status-banner.safe    { background: #f0fdf4 !important; border-color: #bbf7d0 !important; }
  .prism-status-banner.safe    .prism-status-banner__icon  { background: ${REPORT_CONFIG.successColor} !important; }
  .prism-status-banner.safe    .prism-status-banner__label { color: ${REPORT_CONFIG.successColor} !important; }
  .prism-status-banner.warning { background: #fefce8 !important; border-color: #fde68a !important; }
  .prism-status-banner.warning .prism-status-banner__icon  { background: ${REPORT_CONFIG.warningColor} !important; }
  .prism-status-banner.warning .prism-status-banner__label { color: ${REPORT_CONFIG.warningColor} !important; }
  .prism-status-banner.danger  { background: #fef2f2 !important; border-color: #fecaca !important; }
  .prism-status-banner.danger  .prism-status-banner__icon  { background: ${REPORT_CONFIG.dangerColor} !important; }
  .prism-status-banner.danger  .prism-status-banner__label { color: ${REPORT_CONFIG.dangerColor} !important; }

  /* ── Two-column grid for fallacies/questions ────── */
  .prism-grid-2 {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 10pt;
    margin: 0 0 12pt;
    direction: ${dir};
  }
  .prism-grid-2 > .prism-card {
    margin-bottom: 0 !important;
  }

  /* ── Section title above visuals ────────────────── */
  .prism-section-title {
    font-family: ${fontDisplay} !important;
    font-size: 9pt !important;
    font-weight: 800 !important;
    text-transform: uppercase;
    letter-spacing: 1.5pt;
    color: #475569 !important;
    margin: 0 0 6pt !important;
    padding: 0 !important;
    border: none !important;
    direction: ${dir};
  }

  /* ── Quoted analysis paragraph ──────────────────── */
  .prism-analysis-quote {
    border-${blockStart}: 2pt solid ${REPORT_CONFIG.accentColor};
    padding: 4pt 0 4pt 10pt;
    padding-${blockEnd}: 0;
    padding-${blockStart}: 10pt;
    margin: 8pt 0 0;
    font-size: 10pt;
    color: #334155 !important;
    line-height: 1.6;
    direction: ${dir};
  }

  /* ── Progress / bias bars ───────────────────────── */
  .prism-bias-bar-wrap {
    background: #e2e8f0 !important;
    border-radius: 99pt;
    height: 7pt;
    width: 100%;
    margin: 4pt 0 8pt;
    overflow: hidden;
    direction: ltr;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .prism-bias-bar-fill {
    height: 100%;
    border-radius: 99pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Section cards (if used) ────────────────────── */
  .prism-card {
    border: 0.75pt solid #e2e8f0;
    border-radius: 4pt;
    padding: 10pt 12pt;
    margin-bottom: 10pt;
    page-break-inside: avoid;
    break-inside: avoid;
    background: #ffffff !important;
  }

  /* ── Divider ────────────────────────────────────── */
  .prism-divider, hr {
    border: none;
    border-top: 0.75pt solid #e2e8f0;
    margin: 12pt 0;
  }

  /* ── Highlight / callout boxes ──────────────────── */
  .prism-callout {
    padding: 8pt 12pt;
    border-radius: 4pt;
    margin-bottom: 10pt;
    page-break-inside: avoid;
    break-inside: avoid;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .prism-callout.info    { background: #eff6ff !important; border-${blockStart}: 3pt solid ${REPORT_CONFIG.accentColor}; }
  .prism-callout.warning { background: #fffbeb !important; border-${blockStart}: 3pt solid ${REPORT_CONFIG.warningColor}; }
  .prism-callout.danger  { background: #fef2f2 !important; border-${blockStart}: 3pt solid ${REPORT_CONFIG.dangerColor}; }

  /* ── End-of-document footer (last page only) ────── */
  .prism-print-footer {
    margin-top: 24pt;
    padding-top: 8pt;
    border-top: 0.75pt solid #e2e8f0;
    text-align: center;
    font-family: ${fontDisplay};
    font-size: 7.5pt;
    color: #94a3b8 !important;
    direction: ${dir};
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-before: avoid;
  }

  .prism-print-footer__text { display: block; }

  /* ── Page-break utilities ───────────────────────── */
  .page-break-before { page-break-before: always; break-before: page; }
  .page-break-after  { page-break-after: always;  break-after: page; }
  .no-break          { page-break-inside: avoid;  break-inside: avoid; }

  /* ── Spacing helpers ────────────────────────────── */
  .print-mt-0 { margin-top: 0 !important; }
  .print-mb-0 { margin-bottom: 0 !important; }

} /* end @media print */
`;
};


// ─── 6. DOM HELPERS ──────────────────────────────────────────

const buildPrintHeader = (meta) => {
  const { dir, isRtl, t, date, time, toolLabel } = meta;

  const dateTimeHtml = isRtl
    ? `${t.dateLabel}: ${date} &nbsp;·&nbsp; ${t.timeLabel}: ${time}`
    : `${date} &nbsp;·&nbsp; ${time}`;

  const header = document.createElement('div');
  header.className = 'prism-print-header';
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
  return header;
};

const buildPrintFooter = (meta) => {
  const { t } = meta;
  const footer = document.createElement('div');
  footer.className = 'prism-print-footer';
  footer.innerHTML = `<span class="prism-print-footer__text">${t.footerText}</span>`;
  return footer;
};

// ─── 6.b VISUAL TRANSFORMERS ─────────────────────────────
// Convert dynamic UI visuals (Tailwind/conic-gradient) into
// print-friendly equivalents that survive the print pipeline.

const transformBiasGauge = (root, meta) => {
  const gauge = root.querySelector('.gauge-wrapper');
  if (!gauge) return;

  const scoreText = gauge.querySelector('.gauge-cover span')?.textContent?.trim() || '';
  const scoreNum  = parseFloat(scoreText) || 0;
  const label     = meta.t === I18N.ar ? 'مؤشر الانحياز' : 'Bias Index';

  const block = document.createElement('div');
  block.className = 'prism-kpi';
  block.innerHTML = `
    <div style="min-width:90pt">
      <div class="prism-kpi__label">${label}</div>
      <div class="prism-kpi__value">${Math.round(scoreNum)}<span style="font-size:12pt;color:#64748b">%</span></div>
    </div>
    <div class="prism-kpi__bar">
      <div class="prism-kpi__marker" style="${meta.isRtl ? 'right' : 'left'}: ${Math.min(100, Math.max(0, scoreNum))}%"></div>
    </div>
  `;
  // Replace the original card containing the gauge entirely
  const card = gauge.closest('.flex.items-start') || gauge.parentElement;
  if (card) card.replaceWith(block);
};

const transformBiasWords = (root) => {
  // Tailwind chips for biased words → print-friendly chips
  root.querySelectorAll('span').forEach(s => {
    const cls = s.className || '';
    if (cls.includes('bg-red-100') || cls.includes('bg-red-500/10')) {
      s.className = 'prism-word-chip';
      s.removeAttribute('style');
    }
  });
};

const transformBiasAnalysisQuote = (root) => {
  // The quoted analysis paragraph (border-l-2 pl-3)
  root.querySelectorAll('p').forEach(p => {
    const cls = p.className || '';
    if (cls.includes('border-l-2') || cls.includes('border-r-2')) {
      p.className = 'prism-analysis-quote';
      p.removeAttribute('style');
    }
  });
};

const transformTruthBanner = (root, meta) => {
  // Locate the truth status banner (has h4 with status text + credibility)
  const banner = root.querySelector('[class*="rounded-xl"][class*="border"][class*="bg-"]');
  if (!banner) return;

  const label  = banner.querySelector('h4')?.textContent?.trim() || '';
  const sub    = banner.querySelector('p')?.textContent?.trim() || '';
  const cls    = banner.className;
  let kind = 'warning';
  if (/text-green/.test(cls)) kind = 'safe';
  else if (/text-red/.test(cls)) kind = 'danger';
  else if (/text-yellow/.test(cls)) kind = 'warning';

  const icon = kind === 'safe' ? '✓' : (kind === 'danger' ? '!' : '?');

  const replacement = document.createElement('div');
  replacement.className = `prism-status-banner ${kind}`;
  replacement.innerHTML = `
    <div class="prism-status-banner__icon">${icon}</div>
    <div>
      <div class="prism-status-banner__label">${label}</div>
      <div class="prism-status-banner__sub">${sub}</div>
    </div>
  `;
  banner.replaceWith(replacement);
};

const transformInfoCards = (root) => {
  // Truth fallacies/questions/recommendations cards
  root.querySelectorAll('[class*="rounded-xl"][class*="bg-white"], [class*="rounded-xl"][class*="bg-slate"]').forEach(card => {
    if (card.classList.contains('prism-status-banner')) return;
    card.className = 'prism-card';
    card.removeAttribute('style');
    card.querySelectorAll('h3, h4').forEach(h => {
      h.className = 'prism-section-title';
      h.removeAttribute('style');
    });
    card.querySelectorAll('ul').forEach(ul => {
      ul.className = '';
      ul.removeAttribute('style');
    });
  });

  // Two-column grids
  root.querySelectorAll('[class*="md:grid-cols-2"], [class*="grid-cols-2"]').forEach(grid => {
    grid.className = 'prism-grid-2';
    grid.removeAttribute('style');
  });
};

const transformVisualsForPrint = (root, meta) => {
  try { transformBiasGauge(root, meta); }        catch (e) { console.warn('bias gauge transform:', e); }
  try { transformBiasWords(root); }              catch (e) { console.warn('bias words transform:', e); }
  try { transformBiasAnalysisQuote(root); }      catch (e) { console.warn('bias quote transform:', e); }
  try { transformTruthBanner(root, meta); }      catch (e) { console.warn('truth banner transform:', e); }
  try { transformInfoCards(root); }              catch (e) { console.warn('info cards transform:', e); }

  // Strip lingering inline opacity/transform animations from cascade reveal
  root.querySelectorAll('[style*="opacity"], [style*="transform"]').forEach(el => {
    el.style.opacity = '';
    el.style.transform = '';
    el.style.transition = '';
  });
};

/**
 * Wraps #results-container content in a proper A4 print wrapper,
 * replacing position:absolute with a true document-flow layout.
 */
const buildPrintWrapper = (meta) => {
  const source = document.getElementById('results-container');
  if (!source) return null;

  // Outer fixed wrapper (fills the viewport / page)
  const wrapper = document.createElement('div');
  wrapper.id = 'print-wrapper';

  // Inner page div (natural document flow)
  const page = document.createElement('div');
  page.id   = 'print-page';
  page.dir  = meta.dir;
  page.lang = meta.lang;

  // Header
  page.appendChild(buildPrintHeader(meta));

  // Content clone — preserves all rendered HTML including markdown output
  const contentWrap = document.createElement('div');
  contentWrap.id = 'print-content';
  contentWrap.innerHTML = source.innerHTML;

  // Remove action buttons / non-print decorations
  contentWrap.querySelectorAll(
    '#download-btn, #copy-btn, #share-btn, #fullscreen-btn, .no-print, [data-no-print], .prism-print-header'
  ).forEach(el => el.remove());

  // Remove the screen-only results header (icon + title + actions row)
  const screenHeader = contentWrap.querySelector('h3')?.parentElement;
  if (screenHeader && screenHeader.querySelector('h3')) screenHeader.remove();

  // Convert dynamic visuals to print-friendly versions
  transformVisualsForPrint(contentWrap, meta);

  page.appendChild(contentWrap);
  page.appendChild(buildPrintFooter(meta));

  wrapper.appendChild(page);
  return wrapper;
};


// ─── 7. PUBLIC API ────────────────────────────────────────────

/**
 * generatePDFReport()
 *
 * Builds a clean A4-ready print layout in a separate DOM wrapper,
 * opens the native print dialog, then removes the wrapper entirely.
 *
 * @param {object}    [opts]
 * @param {'ar'|'en'} [opts.lang]          Force a language.
 * @param {string}    [opts.toastMessage]  Override the loading toast.
 * @param {number}    [opts.delay=400]     Ms before window.print() fires.
 * @returns {Promise<void>}
 */
export const generatePDFReport = (opts = {}) => {
  const { lang: forceLang, delay = 400 } = opts;

  return new Promise((resolve) => {

    // ① Metadata
    const meta = buildMeta();
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

    // ③ Build and inject the A4 wrapper
    const wrapperEl = buildPrintWrapper(meta);
    if (wrapperEl) document.body.appendChild(wrapperEl);

    // ④ Disable dark mode temporarily
    const wasDark = document.documentElement.classList.contains('dark');
    if (wasDark) document.documentElement.classList.remove('dark');

    // ⑤ Notify user
    showToast(toastMessage, 'success');

    // ⑥ Print then clean up
    setTimeout(() => {
      window.print();

      styleEl.remove();
      wrapperEl?.remove();
      if (wasDark) document.documentElement.classList.add('dark');

      resolve();
    }, delay);
  });
};
