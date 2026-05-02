const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    endpoint: {
        type: String,
        required: true,
        enum: ['summarize', 'bias', 'recycle', 'truthGuard', 'synthesis', 'audioAnalysis']
    },
    inputText: {
        type: String,
        required: false, // يمكن أن يكون فارغاً إذا كان المرفق ملفاً صوتياً
    },
    aiResult: {
        type: mongoose.Schema.Types.Mixed, // يقبل String (Markdown) أو Object (JSON)
        required: true,
    },
    language: {
        type: String,
        default: 'auto'
    },
    options: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true // يقوم بإنشاء createdAt و updatedAt تلقائياً
});

module.exports = mongoose.model('Report', ReportSchema);
