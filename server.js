'use strict';

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const mongoose     = require('mongoose');
const config       = require('./config/env');
const aiRoutes     = require('./routes/aiRoutes');
const errorHandler = require('./middlewares/errorHandler');
const connectDB    = require('./config/db');

const app = express();

// ──────────────────────────────────────────────
// Database Connection
// ──────────────────────────────────────────────
connectDB();

// ──────────────────────────────────────────────
// 1. Security Headers
// ──────────────────────────────────────────────
// CSP مُعطَّل مؤقتاً لدعم Tailwind CDN — يجب تفعيله مع CSP مخصص في الإنتاج
app.use(helmet({ contentSecurityPolicy: false }));

// ──────────────────────────────────────────────
// 2. CORS — مقيّد بالنطاق المحدد في config
// ──────────────────────────────────────────────
app.use(cors({
    origin:         config.ALLOWED_ORIGIN,
    methods:        ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

// ──────────────────────────────────────────────
// 3. Body Parser — بحد أقصى 1MB للـ JSON
// ──────────────────────────────────────────────
app.use(express.json({ limit: '4mb' })); // يستوعب حتى 800,000 حرف عربي (~200k توكن)

// ──────────────────────────────────────────────
// 4. Rate Limiting
// ──────────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs:       15 * 60 * 1000, // 15 دقيقة
    max:            100,
    standardHeaders: true,
    legacyHeaders:  false,
    message: { success: false, error: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً.' },
});

// ──────────────────────────────────────────────
// 5. Static Frontend Files
// ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'frontend')));

// ──────────────────────────────────────────────
// 6. Health Check — مطلوب لـ Cloud Run Readiness Probe
// ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.status(200).json({
        status:    'ok',
        model:     config.GEMINI_MODEL,
        db:        dbStates[mongoose.connection.readyState] || 'unknown',
        dbHost:    mongoose.connection.host || null,
        dbName:    mongoose.connection.name || null,
        timestamp: new Date().toISOString(),
    });
});

// ──────────────────────────────────────────────
// 7. API Routes
// ──────────────────────────────────────────────
const historyRoutes = require('./routes/historyRoutes');

app.use('/api', apiLimiter, aiRoutes);
app.use('/api/history', apiLimiter, historyRoutes);

// ──────────────────────────────────────────────
// 8. Global Error Handler (يجب أن يكون آخر middleware)
// ──────────────────────────────────────────────
app.use(errorHandler);

// ──────────────────────────────────────────────
// Boot
// ──────────────────────────────────────────────
app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
    console.log(`🧠 AI Engine  : ${config.GEMINI_MODEL}`);
    console.log(`🌐 CORS Origin: ${config.ALLOWED_ORIGIN}`);
    console.log(`🔧 Environment: ${config.NODE_ENV}`);
});
