'use strict';

/**
 * urlValidator.js
 * يمنع هجمات SSRF عبر التحقق من البروتوكول والعناوين المحظورة.
 * Separation of Concern: منطق التحقق من الروابط معزول هنا فقط.
 */

const BLOCKED_HOSTNAMES = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '169.254.169.254', // GCP / AWS metadata endpoint
    'metadata.google.internal',
]);

// يمنع نطاقات الـ IP الخاصة (Private IP ranges)
const PRIVATE_IP_REGEX = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/;

/**
 * يتحقق مما إذا كان الـ URL آمناً للاتصال به من الخادم.
 * @param {string} rawUrl
 * @returns {{ valid: boolean, reason?: string }}
 */
const validatePublicUrl = (rawUrl) => {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return { valid: false, reason: 'الرابط غير صالح.' };
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, reason: 'البروتوكول غير مدعوم. يُسمح فقط بـ http وhttps.' };
    }

    if (BLOCKED_HOSTNAMES.has(parsed.hostname)) {
        return { valid: false, reason: 'الرابط يشير إلى عنوان محظور.' };
    }

    if (PRIVATE_IP_REGEX.test(parsed.hostname)) {
        return { valid: false, reason: 'الرابط يشير إلى شبكة خاصة محظورة.' };
    }

    return { valid: true };
};

module.exports = { validatePublicUrl };
