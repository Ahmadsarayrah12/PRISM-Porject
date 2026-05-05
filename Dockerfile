# استخدام صورة Node.js خفيفة لبيئة الإنتاج (مثالية لـ Cloud Run)
FROM node:20-alpine

# تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات الاعتماديات لتثبيتها (تساعد في استغلال كاش Docker)
COPY package*.json ./

# تثبيت الاعتماديات الأساسية فقط بدون حزم التطوير
RUN npm install --production

# نسخ جميع ملفات المشروع إلى الحاوية
COPY . .

# ⚠️ ملاحظة مهمة:
# لا تنسخ .env — استخدم متغيرات البيئة من Cloud Run
# إذا احتجت key.json، استخدم Secret Manager أو ضعه في المتغيرات

# فتح المنفذ 8080 (المنفذ الافتراضي الذي يعتمد عليه Google Cloud Run)
EXPOSE 8080

# أمر تشغيل الخادم
CMD ["node", "server.js"]
