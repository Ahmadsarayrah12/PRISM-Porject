require('dotenv').config();

module.exports = {
    PORT:           process.env.PORT           || 8080,
    NODE_ENV:       process.env.NODE_ENV       || 'development',
    GEMINI_MODEL:   'gemini-2.5-pro',
    GCP_PROJECT:    process.env.GOOGLE_CLOUD_PROJECT  || 'your-project-id',
    GCP_LOCATION:   process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    // CORS: حدد النطاق الإنتاجي في .env — انظر .env.example
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || '*',
    // GCS: اختياري — مطلوب فقط لدعم ملفات الوسائط الأكبر من 10 MB
    GCS_BUCKET:     process.env.GCS_BUCKET     || null,
    // Database — لا قيمة افتراضية: يجب تعريف MONGO_URI في البيئة (.env محلياً، أو env vars في Cloud Run)
    MONGO_URI:      process.env.MONGO_URI      || null,
};
