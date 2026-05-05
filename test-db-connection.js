#!/usr/bin/env node

/**
 * 🧪 سكريبت اختبار الاتصال بقاعدة البيانات
 * 
 * الاستخدام:
 * npm install dotenv mongoose
 * node test-db-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ خطأ: MONGO_URI غير محدّد في ملف .env');
    process.exit(1);
}

console.log('🔌 محاولة الاتصال بـ MongoDB...');
const safeUri = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
console.log(`📍 الرابط: ${safeUri}`);

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
}).then(() => {
    console.log('✅ اتصال ناجح!');
    console.log(`✅ قاعدة البيانات: ${mongoose.connection.db.databaseName}`);
    console.log(`✅ الخادم: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // عرض عدد المجموعات
    mongoose.connection.db.listCollections().toArray((err, collections) => {
        if (!err) {
            console.log(`\n📊 عدد المجموعات: ${collections.length}`);
            if (collections.length > 0) {
                console.log('📋 المجموعات:');
                collections.forEach(col => console.log(`   - ${col.name}`));
            } else {
                console.log('⚠️ لا توجد مجموعات في قاعدة البيانات');
            }
        }
        process.exit(0);
    });
}).catch(err => {
    console.error('❌ فشل الاتصال:');
    console.error(`   Error: ${err.message}`);
    
    // تلميحات للمساعدة
    if (err.message.includes('ENOTFOUND')) {
        console.error('\n💡 التلميح: لا يمكن الوصول للخادم. تحقق من:');
        console.error('   1. اسم النطاق صحيح في MONGO_URI');
        console.error('   2. الاتصال بالإنترنت يعمل');
        console.error('   3. MongoDB Atlas يسمح بـ 0.0.0.0/0 في Network Access');
    } else if (err.message.includes('authentication failed')) {
        console.error('\n💡 التلميح: فشل المصادقة. تحقق من:');
        console.error('   1. اسم المستخدم صحيح');
        console.error('   2. كلمة المرور صحيحة');
        console.error('   3. المستخدم له صلاحيات على قاعدة البيانات');
    } else if (err.message.includes('connect')) {
        console.error('\n💡 التلميح: فشل الاتصال. تحقق من:');
        console.error('   1. MongoDB Atlas يعمل');
        console.error('   2. شبكتك تسمح بالاتصالات الخارجية');
        console.error('   3. 0.0.0.0/0 مضاف إلى Network Access');
    }
    
    process.exit(1);
});
