'use strict';

const express        = require('express');
const multer         = require('multer');

const aiController   = require('../controllers/aiController');
const validateInput  = require('../middlewares/validateInput');
const validateFile   = require('../middlewares/validateFile');

// الملفات تُخزَّن في الذاكرة مؤقتاً ثم تُرسَل مباشرة لـ Gemini (بدون حفظ على القرص)
const upload = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

const router = express.Router();

// توجيه المسارات إلى وظائفها في المتحكم مع تطبيق ميدل وير التحقق للروابط التي تتطلب نصوص
router.post('/summarize', validateInput, aiController.summarize);
router.post('/bias', validateInput, aiController.bias);
router.post('/recycle', validateInput, aiController.recycle);
router.post('/truth-guard', validateInput, aiController.truthGuard);
router.post('/synthesis', validateInput, aiController.synthesis);

// مسارات تتطلب URL أو ملف وسائط
router.post('/scrape', aiController.scrapeUrl);

// validateFile يتحقق من وجود الملف ونوعه قبل الوصول للـ controller
router.post('/audio', upload.single('media'), validateFile, aiController.audioAnalysis);

module.exports = router;
