'use strict';

const catchAsync = require('../utils/catchAsync');
const Report = require('../models/Report');

const mongoose = require('mongoose');

// جلب جميع التقارير بترتيب تنازلي (الأحدث أولاً)
exports.getAllHistory = catchAsync(async (req, res) => {
    // التحقق من حالة الاتصال بقاعدة البيانات لتجنب التعليق اللانهائي
    if (mongoose.connection.readyState !== 1) {
        return res.status(200).json({ success: true, data: [] });
    }

    // نجلب آخر 50 تقرير للحفاظ على سرعة الأداء
    const reports = await Report.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, data: reports });
});

// حذف تقرير محدد بواسطة الـ ID
exports.deleteHistory = catchAsync(async (req, res) => {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
        return res.status(404).json({ success: false, error: 'التقرير غير موجود.' });
    }
    res.status(200).json({ success: true, message: 'تم حذف التقرير بنجاح.' });
});

// تبديل حالة المفضلة لتقرير محدد
exports.toggleFavorite = catchAsync(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, error: 'قاعدة البيانات غير متصلة.' });
    }
    const report = await Report.findById(req.params.id);
    if (!report) {
        return res.status(404).json({ success: false, error: 'التقرير غير موجود.' });
    }
    report.favorite = !report.favorite;
    await report.save();
    res.status(200).json({ success: true, data: { _id: report._id, favorite: report.favorite } });
});
