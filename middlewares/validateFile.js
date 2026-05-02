'use strict';

/**
 * validateFile.js — Middleware
 * يتحقق من وجود الملف المرفوع وأن نوعه صوتي أو مرئي مدعوم من Vertex AI.
 *
 * قائمة الأنواع المدعومة مأخوذة من:
 * https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/send-multimodal-prompts
 */

// أنواع الصوت المدعومة من Vertex AI Gemini
const ALLOWED_AUDIO_TYPES = new Set([
    'audio/aac',
    'audio/flac',
    'audio/mp3',
    'audio/mpeg',       // mp3 على بعض الأنظمة
    'audio/mpga',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',      // iTunes / Apple
    'audio/opus',
    'audio/pcm',
    'audio/wav',
    'audio/x-wav',
    'audio/webm',
    'audio/ogg',
]);

// أنواع الفيديو المدعومة من Vertex AI Gemini
const ALLOWED_VIDEO_TYPES = new Set([
    'video/mp4',
    'video/mpeg',
    'video/mpg',
    'video/mov',
    'video/quicktime',  // .mov على macOS
    'video/avi',
    'video/x-msvideo',  // .avi على Windows
    'video/x-flv',
    'video/webm',
    'video/wmv',
    'video/x-ms-wmv',
    'video/3gpp',
    'video/3gpp2',
    'video/ogg',
    'video/x-matroska', // .mkv
]);

const ALLOWED_MIME_TYPES = new Set([
    ...ALLOWED_AUDIO_TYPES,
    ...ALLOWED_VIDEO_TYPES,
]);

// الحد الأقصى لحجم الملف: 20 MB (يُطبَّق أيضاً في multer)
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

module.exports = (req, res, next) => {
    if (!req.file) {
        const error = new Error('ملف الوسائط مطلوب.');
        error.statusCode = 400;
        return next(error);
    }

    if (!ALLOWED_MIME_TYPES.has(req.file.mimetype)) {
        const error = new Error(
            `نوع الملف غير مدعوم: "${req.file.mimetype}". ` +
            `يُسمح فقط بملفات الصوت (mp3, aac, wav, m4a, ...) والفيديو (mp4, avi, mov, mkv, ...).`
        );
        error.statusCode = 415;
        return next(error);
    }

    if (req.file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (req.file.size / 1024 / 1024).toFixed(1);
        const error = new Error(
            `حجم الملف (${sizeMB} MB) يتجاوز الحد الأقصى المسموح به (20 MB).`
        );
        error.statusCode = 413;
        return next(error);
    }

    next();
};
