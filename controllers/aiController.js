'use strict';

const geminiService   = require('../services/geminiService');
const prompts         = require('../utils/prompts');
const catchAsync      = require('../utils/catchAsync');
const { validatePublicUrl } = require('../utils/urlValidator');
const axios   = require('axios');
const cheerio = require('cheerio');
const Report  = require('../models/Report');
const config  = require('../config/env');
const mongoose = require('mongoose');

// ==========================================
// 🛠️ دالة إعادة المحاولة الذكية لتجاوز خطأ 429
// ==========================================
const executeWithRetry = async (fn, retries = 3, delayMs = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            // التحقق مما إذا كان الخطأ هو 429 أو استنفاد الموارد
            const isRateLimit = 
                error?.response?.status === 429 || 
                error?.message?.includes('429') || 
                error?.status === 'RESOURCE_EXHAUSTED' ||
                error?.code === 429;

            if (isRateLimit && i < retries - 1) {
                console.warn(`⚠️ ضغط طلبات (429). جاري المحاولة ${i + 1} بعد ${delayMs / 1000} ثوانٍ...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                delayMs *= 2; // مضاعفة وقت الانتظار في المحاولة القادمة (2s -> 4s -> 8s)
            } else {
                throw error; // إذا كان خطأ آخر، أو انتهت المحاولات، ارمِ الخطأ
            }
        }
    }
};

const parseJsonFromGemini = (text) => {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            const jsonStr = text.substring(start, end + 1);
            return JSON.parse(jsonStr);
        }
        return JSON.parse(text);
    } catch(e) {
        throw new Error('فشل في قراءة الرد المهيكل من الذكاء الاصطناعي.');
    }
};

// دالة مساعدة لحفظ التقرير في قاعدة البيانات (بدون إيقاف السيرفر في حال فشل الحفظ)
const READY_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

const saveReportToDB = async (endpoint, inputText, aiResult, options) => {
    if (!config.MONGO_URI) {
        console.warn(`⚠️ [${endpoint}] لم يُحفظ — MONGO_URI غير مُعرَّف.`);
        return null;
    }
    if (mongoose.connection.readyState !== 1) {
        console.warn(`⚠️ [${endpoint}] لم يُحفظ — حالة Mongo: ${READY_STATES[mongoose.connection.readyState] || 'unknown'}`);
        return null;
    }
    try {
        const report = await Report.create({
            endpoint,
            inputText: inputText || '',
            aiResult,
            language: options?.outputLang || 'auto',
            options: options || {}
        });
        console.log(`💾 [${endpoint}] تم الحفظ — id: ${report._id}`);
        return report._id;
    } catch (err) {
        console.error(`❌ [${endpoint}] فشل الحفظ:`, err.message, err.errors || '');
        return null;
    }
};

// 1. أداة التلخيص (ترجع Markdown)
exports.summarize = catchAsync(async (req, res) => {
    const prompt = prompts.summarize(req.body.options);
    const result = await executeWithRetry(() => geminiService.callGemini(prompt, req.body.text));
    const reportId = await saveReportToDB('summarize', req.body.text, result, req.body.options);
    res.status(200).json({ success: true, type: 'markdown', result, reportId });
});

// 2. أداة الموضوعية (ترجع JSON المهيكل للمؤشرات البصرية)
exports.bias = catchAsync(async (req, res) => {
    const prompt = prompts.bias(req.body.options);
    const textResult = await executeWithRetry(() => geminiService.callGemini(prompt, req.body.text));
    const result = parseJsonFromGemini(textResult);
    const reportId = await saveReportToDB('bias', req.body.text, result, req.body.options);
    res.status(200).json({ success: true, type: 'json_bias', result, reportId });
});

// 3. أداة إعادة التدوير (ترجع Markdown)
exports.recycle = catchAsync(async (req, res) => {
    const prompt = prompts.recycle(req.body.options);
    const result = await executeWithRetry(() => geminiService.callGemini(prompt, req.body.text));
    const reportId = await saveReportToDB('recycle', req.body.text, result, req.body.options);
    res.status(200).json({ success: true, type: 'markdown', result, reportId });
});

// 4. أداة درع الحقيقة (ترجع JSON المهيكل لتنبيهات الأمان)
exports.truthGuard = catchAsync(async (req, res) => {
    const prompt = prompts.truthGuard(req.body.options);
    const textResult = await executeWithRetry(() => geminiService.callGemini(prompt, req.body.text));
    const result = parseJsonFromGemini(textResult);
    const reportId = await saveReportToDB('truthGuard', req.body.text, result, req.body.options);
    res.status(200).json({ success: true, type: 'json_truth', result, reportId });
});

// 5. أداة دمج الروايات المتعددة (Synthesis)
exports.synthesis = catchAsync(async (req, res) => {
    const prompt = prompts.synthesis(req.body.options);
    const result = await executeWithRetry(() => geminiService.callGemini(prompt, req.body.text));
    const reportId = await saveReportToDB('synthesis', req.body.text, result, req.body.options);
    res.status(200).json({ success: true, type: 'markdown', result, reportId });
});

// 6. أداة سحب المقالات عبر الرابط (Scraper) - لم تتغير لأنها لا تكلم Gemini مباشرة
exports.scrapeUrl = catchAsync(async (req, res) => {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, error: 'الرابط مطلوب.' });
    }

    const { valid, reason } = validatePublicUrl(url);
    if (!valid) {
        return res.status(400).json({ success: false, error: reason });
    }

    const response = await axios.get(url, {
        timeout: 10_000, 
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PrismBot/1.0)' },
    });

    const $ = cheerio.load(response.data);
    $('script, style, nav, header, footer, iframe, aside, .ads, .menu, noscript').remove();

    let text = $('body').text().replace(/\s+/g, ' ').trim();
    if (text.length > 25_000) text = text.substring(0, 25_000);

    res.status(200).json({ success: true, text });
});

// 7. أداة تحليل الوسائط (الصوت والفيديو)
exports.audioAnalysis = catchAsync(async (req, res) => {
    const { file } = req;
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);

    console.log(`📎 Media analysis: ${file.originalname || 'unnamed'} | ${file.mimetype} | ${fileSizeMB} MB`);

    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const prompt = prompts.audioAnalysis(options);
    const userMsg = 'الرجاء تفريغ هذا المقطع وتحليله بناءً على التعليمات.';

    const result = await executeWithRetry(() => geminiService.callGeminiWithMedia(prompt, userMsg, file));
    const reportId = await saveReportToDB('audioAnalysis', `Media: ${file.originalname}`, result, options);
    res.status(200).json({ success: true, type: 'markdown', result, reportId });
});

// ==========================================
// 🌊 Streaming endpoints (SSE) — markdown only
// ==========================================
const setupSSE = (res) => {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();
};

const sendSSE = (res, data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const runStream = async (res, endpoint, inputText, options, streamFactory) => {
    setupSSE(res);
    let fullText = '';
    try {
        const stream = await streamFactory();
        for await (const chunk of stream) {
            fullText += chunk;
            sendSSE(res, { chunk });
        }
        const reportId = await saveReportToDB(endpoint, inputText, fullText, options);
        sendSSE(res, { done: true, type: 'markdown', reportId });
    } catch (err) {
        console.error(`❌ Stream error [${endpoint}]:`, err.message);
        sendSSE(res, { error: err.message || 'حدث خطأ أثناء الاتصال بالنموذج.' });
    } finally {
        res.end();
    }
};

exports.summarizeStream = async (req, res) => {
    const prompt = prompts.summarize(req.body.options);
    await runStream(res, 'summarize', req.body.text, req.body.options,
        () => geminiService.callGeminiStream(prompt, req.body.text));
};

exports.recycleStream = async (req, res) => {
    const prompt = prompts.recycle(req.body.options);
    await runStream(res, 'recycle', req.body.text, req.body.options,
        () => geminiService.callGeminiStream(prompt, req.body.text));
};

exports.synthesisStream = async (req, res) => {
    const prompt = prompts.synthesis(req.body.options);
    await runStream(res, 'synthesis', req.body.text, req.body.options,
        () => geminiService.callGeminiStream(prompt, req.body.text));
};

exports.audioAnalysisStream = async (req, res) => {
    const { file } = req;
    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const prompt  = prompts.audioAnalysis(options);
    const userMsg = 'الرجاء تفريغ هذا المقطع وتحليله بناءً على التعليمات.';

    await runStream(res, 'audioAnalysis', `Media: ${file.originalname}`, options,
        () => geminiService.callGeminiWithMediaStream(prompt, userMsg, file));
};