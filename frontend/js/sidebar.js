'use strict';

/**
 * sidebar.js
 * يتحكم في سلوك الشريط الجانبي على شاشات الجوال.
 * Separation of Concern: كل منطق فتح/إغلاق السايدبار معزول هنا فقط.
 */

const sidebar  = document.getElementById('sidebar');
const overlay  = document.getElementById('sidebar-overlay');
const openBtn  = document.getElementById('sidebar-open-btn');

const openSidebar = () => {
    sidebar.classList.add('sidebar-open');
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden', 'md:overflow-auto');
};

const closeSidebar = () => {
    sidebar.classList.remove('sidebar-open');
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
};

openBtn?.addEventListener('click', openSidebar);
overlay?.addEventListener('click', closeSidebar);

// إغلاق السايدبار تلقائياً عند اختيار أداة على الجوال
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (window.innerWidth < 768) closeSidebar();
    });
});

// إغلاق السايدبار عند تغيير حجم الشاشة لـ Desktop
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeSidebar();
});

export { openSidebar, closeSidebar };
