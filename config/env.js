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
    // Database
    MONGO_URI:      process.env.MONGO_URI      || 'mongodb+srv://ahmadsarayrah1122_db_user:1lLZFEFTD2XwnMW4@ahmad1122.fbre4kv.mongodb.net/prism?appName=ahmad1122',
};
