const mongoose = require('mongoose');
const config = require('./env');

// أحداث الاتصال — لتشخيص مشاكل الإنتاج (Cloud Run / Atlas)
mongoose.connection.on('connected',    () => console.log('🟢 Mongo: connected'));
mongoose.connection.on('disconnected', () => console.warn('🟡 Mongo: disconnected'));
mongoose.connection.on('reconnected',  () => console.log('🟢 Mongo: reconnected'));
mongoose.connection.on('error',        (err) => console.error('🔴 Mongo error:', err.message));

const connectDB = async () => {
    if (!config.MONGO_URI) {
        console.warn('⚠️ MONGO_URI غير مُعرَّف — ميزة حفظ السجل معطّلة.');
        return;
    }

    // إخفاء كلمة المرور عند الطباعة
    const safeUri = config.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    console.log(`🔌 Mongo: محاولة الاتصال — ${safeUri}`);

    mongoose.set('bufferCommands', false);
    mongoose.set('strictQuery', true);

    try {
        const conn = await mongoose.connect(config.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS:          15000,
            connectTimeoutMS:         10000,
            maxPoolSize:              10,
            retryWrites:              true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('ENOTFOUND')) {
            console.error('💡 تلميح: تأكد من إضافة 0.0.0.0/0 إلى Network Access في MongoDB Atlas (Cloud Run يستخدم IPs ديناميكية).');
        }
    }
};

module.exports = connectDB;
