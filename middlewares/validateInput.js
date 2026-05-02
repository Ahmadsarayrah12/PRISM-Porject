'use strict';

const MAX_TEXT_LENGTH = 800_000; // ~200,000 توكن عربي (حد نموذج Gemini 2.5 Pro: 1M توكن)

module.exports = (req, res, next) => {
    const { text, options } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
        const error = new Error('النص الصحفي مطلوب ولا يمكن أن يكون فارغاً.');
        error.statusCode = 400;
        return next(error);
    }

    if (text.length > MAX_TEXT_LENGTH) {
        const error = new Error(`النص طويل جداً. الحد الأقصى المسموح به هو ${MAX_TEXT_LENGTH.toLocaleString()} حرف.`);
        error.statusCode = 413; // Payload Too Large
        return next(error);
    }

    // تنظيف وتطبيع المدخلات
    req.body.text    = text.trim();
    req.body.options = (options && typeof options === 'object') ? options : {};

    next();
};
