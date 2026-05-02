const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
    try {
        if (!config.MONGO_URI) {
            console.warn('⚠️ لم يتم العثور على MONGO_URI في المتغيرات البيئية. سيتم إيقاف ميزة حفظ السجل.');
            return;
        }
        
        // إلغاء الانتظار اللانهائي للأوامر
        mongoose.set('bufferCommands', false);
        
        const conn = await mongoose.connect(config.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // لا تنتظر أكثر من 5 ثوانٍ
            socketTimeoutMS: 10000,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // لا نوقف السيرفر، بل نتركه يعمل بدون حفظ التقارير
    }
};

module.exports = connectDB;
