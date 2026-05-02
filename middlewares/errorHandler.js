module.exports = (err, req, res, next) => {
    console.error('🔥 Error caught by Global Handler:', err.message);

    // تحديد حالة الخطأ (500 كخطأ افتراضي)
    const statusCode = err.statusCode || 500;
    const message = err.message || 'حدث خطأ داخلي في الخادم أثناء الاتصال بالذكاء الاصطناعي.';

    res.status(statusCode).json({
        success: false,
        error: message,
        // إخفاء الـ Stack Trace في بيئة الإنتاج لأسباب أمنية
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
