'use strict';

/**
 * geminiService.js
 * الطبقة الوحيدة المسؤولة عن التواصل مع Google Gemini.
 *
 * يستخدم الـ SDK الرسمي الجديد: @google/genai
 * (الـ SDK القديم @google-cloud/vertexai مُهمَل منذ يونيو 2025)
 *
 * آلية إرسال الوسائط:
 *   ≤ 10 MB  → inlineData (base64 مباشر)
 *   > 10 MB  → GCS upload (يتطلب GCS_BUCKET في .env)
 */

const { GoogleGenAI }  = require('@google/genai');
const { Storage }      = require('@google-cloud/storage');
const { v4: uuidv4 }   = require('uuid');
const path             = require('path');
const config           = require('../config/env');

// ──────────────────────────────────────────────
// الثوابت
// ──────────────────────────────────────────────
const TEXT_TIMEOUT_MS    = 120_000;            // 2 دقيقة للنصوص
const MEDIA_TIMEOUT_MS   = 300_000;            // 5 دقائق للوسائط
const INLINE_LIMIT_BYTES = 10 * 1024 * 1024;   // 10 MB حد الإرسال المباشر

// ──────────────────────────────────────────────
// تهيئة العملاء
// ──────────────────────────────────────────────
const ai = new GoogleGenAI({
    vertexai: true,
    project:  config.GCP_PROJECT,
    location: config.GCP_LOCATION,
});

const storage = config.GCS_BUCKET ? new Storage() : null;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** ينتهي بـ Error بعد مدة محددة إذا لم يستجب النموذج. */
const createTimeout = (ms) =>
    new Promise((_, reject) =>
        setTimeout(
            () => reject(new Error(`انتهت مهلة الاتصال بنموذج الذكاء الاصطناعي (${ms / 1000}s).`)),
            ms
        )
    );

/** يرفع الملف إلى GCS ويُعيد الـ URI. */
const uploadToGCS = async (file) => {
    const bucket   = storage.bucket(config.GCS_BUCKET);
    const ext      = path.extname(file.originalname || '.tmp');
    const fileName = `prism-media/${uuidv4()}${ext}`;
    const gcsFile  = bucket.file(fileName);

    await gcsFile.save(file.buffer, { contentType: file.mimetype });
    return `gs://${config.GCS_BUCKET}/${fileName}`;
};

// ──────────────────────────────────────────────
// الدوال المُصدَّرة
// ──────────────────────────────────────────────

/**
 * يرسل نصاً إلى Gemini ويُعيد الرد.
 * @param {string} systemInstruction
 * @param {string} userText
 * @returns {Promise<string>}
 */
const callGemini = async (systemInstruction, userText) => {
    const responsePromise = ai.models.generateContent({
        model:    config.GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        config: {
            systemInstruction,
            temperature: 0.3,
        },
    });

    const response = await Promise.race([
        responsePromise,
        createTimeout(TEXT_TIMEOUT_MS),
    ]);

    return response.text;
};

/**
 * يرسل ملف وسائط (صوت/فيديو) إلى Gemini.
 *   - ملفات ≤ 10MB: inline base64
 *   - ملفات > 10MB + GCS_BUCKET: رفع لـ GCS ثم fileData URI
 *   - ملفات > 10MB بدون GCS: خطأ واضح
 * @param {string} systemInstruction
 * @param {string} userText
 * @param {Express.Multer.File} file
 * @returns {Promise<string>}
 */
const callGeminiWithMedia = async (systemInstruction, userText, file) => {
    let mediaPart;

    if (file.buffer.length <= INLINE_LIMIT_BYTES) {
        // ✅ ملف صغير — إرسال مباشر كـ base64
        mediaPart = {
            inlineData: {
                mimeType: file.mimetype,
                data:     file.buffer.toString('base64'),
            },
        };
    } else if (storage && config.GCS_BUCKET) {
        // ✅ ملف كبير — رفع لـ GCS أولاً
        const gcsUri = await uploadToGCS(file);
        mediaPart = {
            fileData: {
                mimeType: file.mimetype,
                fileUri:  gcsUri,
            },
        };
    } else {
        // ❌ ملف كبير بدون GCS
        const sizeMB = (file.buffer.length / 1024 / 1024).toFixed(1);
        throw Object.assign(
            new Error(
                `حجم الملف (${sizeMB} MB) يتجاوز حد الإرسال المباشر (10 MB). ` +
                `أضف GCS_BUCKET إلى ملف .env لدعم الملفات الكبيرة.`
            ),
            { statusCode: 413 }
        );
    }

    const responsePromise = ai.models.generateContent({
        model:    config.GEMINI_MODEL,
        contents: [{
            role:  'user',
            parts: [{ text: userText }, mediaPart],
        }],
        config: {
            systemInstruction,
            temperature: 0.3,
        },
    });

    const response = await Promise.race([
        responsePromise,
        createTimeout(MEDIA_TIMEOUT_MS),
    ]);

    return response.text;
};

/**
 * نسخة streaming من callGemini — تعيد async iterator يعطي أجزاء النص تدريجياً.
 * @param {string} systemInstruction
 * @param {string} userText
 * @returns {AsyncIterable<string>}
 */
const callGeminiStream = async function* (systemInstruction, userText) {
    const responseStream = await ai.models.generateContentStream({
        model:    config.GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        config: {
            systemInstruction,
            temperature: 0.3,
        },
    });

    for await (const chunk of responseStream) {
        if (chunk?.text) yield chunk.text;
    }
};

/**
 * نسخة streaming من callGeminiWithMedia — تعطي أجزاء النص تدريجياً للوسائط.
 * @param {string} systemInstruction
 * @param {string} userText
 * @param {Express.Multer.File} file
 * @returns {AsyncIterable<string>}
 */
const callGeminiWithMediaStream = async function* (systemInstruction, userText, file) {
    let mediaPart;

    if (file.buffer.length <= INLINE_LIMIT_BYTES) {
        mediaPart = {
            inlineData: {
                mimeType: file.mimetype,
                data:     file.buffer.toString('base64'),
            },
        };
    } else if (storage && config.GCS_BUCKET) {
        const gcsUri = await uploadToGCS(file);
        mediaPart = {
            fileData: {
                mimeType: file.mimetype,
                fileUri:  gcsUri,
            },
        };
    } else {
        const sizeMB = (file.buffer.length / 1024 / 1024).toFixed(1);
        throw Object.assign(
            new Error(
                `حجم الملف (${sizeMB} MB) يتجاوز حد الإرسال المباشر (10 MB). ` +
                `أضف GCS_BUCKET إلى ملف .env لدعم الملفات الكبيرة.`
            ),
            { statusCode: 413 }
        );
    }

    const responseStream = await ai.models.generateContentStream({
        model:    config.GEMINI_MODEL,
        contents: [{
            role:  'user',
            parts: [{ text: userText }, mediaPart],
        }],
        config: {
            systemInstruction,
            temperature: 0.3,
        },
    });

    for await (const chunk of responseStream) {
        if (chunk?.text) yield chunk.text;
    }
};

module.exports = { callGemini, callGeminiWithMedia, callGeminiStream, callGeminiWithMediaStream };
