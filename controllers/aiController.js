const express = require('express');
const router = express.Router();
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config();

// تهيئة اتصال Vertex AI
// ملاحظة: في بيئة الإنتاج على Cloud Run ستكون هذه المتغيرات متاحة تلقائياً أو معدة مسبقاً
const project = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

const vertex_ai = new VertexAI({ project: project, location: location });
const modelName = 'gemini-2.5-flash';

// دالة مساعدة مركزية لاستدعاء نموذج Gemini
async function callGemini(systemInstruction, userText) {
    const generativeModel = vertex_ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: 0.3,
        },
        systemInstruction: {
            role: 'system',
            parts: [{ text: systemInstruction }]
        }
    });

    const request = {
        contents: [
            { role: 'user', parts: [{ text: userText }] }
        ],
    };

    const responseStream = await generativeModel.generateContent(request);
    const result = await responseStream.response;
    
    // استخراج النص النهائي من الرد
    return result.candidates[0].content.parts[0].text;
}

// 1. أداة التلخيص (Summarize)
router.post('/summarize', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'النص الصحفي مطلوب' });

        const systemPrompt = `أنت مساعد إعلامي محترف. مهمتك هي تلخيص الخبر الصحفي المقدم لك.
يجب أن يكون الرد بتنسيق Markdown حصراً ويتضمن:
1. 3 عناوين مقترحة للخبر (كقائمة).
2. ملخص للخبر لا يتجاوز 3 أسطر.
3. 3 أرقام أو إحصائيات هامة مذكورة في الخبر (إذا لم يوجد، اذكر أنه لا يوجد).`;

        const result = await callGemini(systemPrompt, text);
        res.json({ result });
    } catch (error) {
        console.error('Error in summarize API:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب في خوادم الذكاء الاصطناعي' });
    }
});

// 2. أداة الموضوعية (Bias)
router.post('/bias', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'النص الصحفي مطلوب' });

        const systemPrompt = `أنت خبير في التحليل الإعلامي والموضوعية. مهمتك تحليل النص الصحفي المقدم لك.
يجب أن يكون الرد بتنسيق Markdown حصراً ويتضمن:
1. الكلمات أو العبارات المنحازة المذكورة في النص.
2. "نسبة الإثارة" في النص (من 0% إلى 100%).
3. إعادة صياغة الخبر بحيادية تامة وبدون أي تحيز.`;

        const result = await callGemini(systemPrompt, text);
        res.json({ result });
    } catch (error) {
        console.error('Error in bias API:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب في خوادم الذكاء الاصطناعي' });
    }
});

// 3. أداة إعادة التدوير (Recycle)
router.post('/recycle', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'النص الصحفي مطلوب' });

        const systemPrompt = `أنت صانع محتوى محترف. مهمتك تحويل الخبر الصحفي المقدم لك إلى محتوى مناسب لمنصات التواصل الاجتماعي.
يجب أن يكون الرد بتنسيق Markdown حصراً ويتضمن:
1. تغريدة مناسبة لمنصة X (تويتر سابقاً) مع علامات التصنيف (Hashtags) المناسبة.
2. منشور احترافي مناسب لمنصة LinkedIn.
3. سكريبت فيديو قصير (Short/Reel) مدته لا تتجاوز 30 ثانية.`;

        const result = await callGemini(systemPrompt, text);
        res.json({ result });
    } catch (error) {
        console.error('Error in recycle API:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب في خوادم الذكاء الاصطناعي' });
    }
});

// 4. أداة درع الحقيقة (Truth Guard)
router.post('/truth-guard', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'النص الصحفي مطلوب' });

        const systemPrompt = `أنت مدقق حقائق صحفي صارم. مهمتك تحليل النص لاكتشاف التضليل والمغالطات.
يجب أن يكون الرد بتنسيق Markdown حصراً ويتضمن:
1. "مؤشر المصداقية": حدد بدقة واحدة من هذه الحالات (آمن، مشبوه، مضلل).
2. استخراج أي مغالطات منطقية أو ادعاءات غير مدعومة بأدلة في النص.
3. توصيات للصحفي للتحقق من صحة هذا الخبر.`;

        const result = await callGemini(systemPrompt, text);
        res.json({ result });
    } catch (error) {
        console.error('Error in truth-guard API:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب في خوادم الذكاء الاصطناعي' });
    }
});

module.exports = router;
