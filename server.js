const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// إعدادات الـ CORS للسماح بالوصول من أي مكان
app.use(cors({ origin: '*' }));

// تحليل البيانات القادمة بتنسيق JSON
app.use(express.json());

// تقديم ملفات الواجهة الأمامية الثابتة
app.use(express.static(path.join(__dirname, 'frontend')));

// استيراد مسارات الـ API للذكاء الاصطناعي
const aiRoutes = require('./controllers/aiController');
app.use('/api', aiRoutes);

// بدء الخادم
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
