document.addEventListener('DOMContentLoaded', () => {
    const toolBtns = document.querySelectorAll('.tool-btn');
    const currentToolTitle = document.getElementById('current-tool-title');
    const processBtn = document.getElementById('process-btn');
    const btnText = document.getElementById('btn-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const newsInput = document.getElementById('news-input');
    const resultsContainer = document.getElementById('results-container');
    const resultsContent = document.getElementById('results-content');
    const copyBtn = document.getElementById('copy-btn');

    // تحديد الأداة الافتراضية
    let currentEndpoint = 'summarize';
    let rawMarkdownResult = '';

    // تبديل الحالة بين الأدوات الـ 4
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. إعادة ضبط تنسيقات جميع الأزرار (الحالة غير النشطة)
            toolBtns.forEach(b => {
                b.classList.remove('bg-blue-600', 'border-blue-300', 'shadow');
                b.classList.add('hover:bg-slate-800', 'border-transparent', 'hover:border-slate-400');
            });
            
            // 2. تفعيل تنسيق الزر المُختار
            btn.classList.add('bg-blue-600', 'border-blue-300', 'shadow');
            btn.classList.remove('hover:bg-slate-800', 'border-transparent', 'hover:border-slate-400');

            // 3. تحديث العنوان الداخلي ونقطة النهاية (Endpoint)
            currentEndpoint = btn.getAttribute('data-endpoint');
            currentToolTitle.textContent = `أداة ${btn.getAttribute('data-title')}`;

            // 4. إخفاء ومسح النتيجة السابقة عند التبديل بين الأدوات
            resultsContainer.classList.add('hidden');
            resultsContent.innerHTML = '';
            rawMarkdownResult = '';
        });
    });

    // معالجة النص عند الضغط على الزر
    processBtn.addEventListener('click', async () => {
        const text = newsInput.value.trim();
        
        // التحقق من إدخال النص
        if (!text) {
            alert('الرجاء إدخال النص الصحفي أولاً في مساحة العمل!');
            return;
        }

        // تعطيل الزر وإظهار مؤشر التحميل (Spinner)
        processBtn.disabled = true;
        processBtn.classList.add('opacity-70', 'cursor-not-allowed');
        btnText.textContent = 'جاري المعالجة...';
        loadingSpinner.classList.remove('hidden');
        resultsContainer.classList.add('hidden');

        try {
            // الاتصال بالخادم عبر الـ Fetch API
            const response = await fetch(`/api/${currentEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            // معالجة الأخطاء في حال فشل الطلب
            if (!response.ok) {
                throw new Error(data.error || 'حدث خطأ غير معروف');
            }

            // الاحتفاظ بالنتيجة الأصلية (Markdown) لتمكين النسخ المباشر
            rawMarkdownResult = data.result;

            // تحويل الـ Markdown إلى HTML باستخدام مكتبة Marked وعرضها
            resultsContent.innerHTML = marked.parse(data.result);
            
            // إظهار حاوية النتائج
            resultsContainer.classList.remove('hidden');

            // التمرير السلس للأسفل لرؤية النتيجة بوضوح
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error('API Error:', error);
            // إظهار رسالة خطأ للمستخدم
            alert(`فشلت العملية: ${error.message}`);
        } finally {
            // إعادة تفعيل الزر وإخفاء مؤشر التحميل في جميع الحالات (نجاح أو فشل)
            processBtn.disabled = false;
            processBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            btnText.textContent = 'معالجة النص';
            loadingSpinner.classList.add('hidden');
        }
    });

    // برمجة زر "نسخ النتيجة"
    copyBtn.addEventListener('click', async () => {
        if (!rawMarkdownResult) return;

        try {
            // استخدام Clipboard API لنسخ النص
            await navigator.clipboard.writeText(rawMarkdownResult);
            
            // تغيير نص الزر وأيقونته مؤقتاً لتأكيد النسخ
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> تم النسخ بنجاح!`;
            copyBtn.classList.replace('text-blue-600', 'text-green-600');
            
            // إعادته للحالة الطبيعية بعد ثانيتين
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.replace('text-green-600', 'text-blue-600');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('حدث خطأ أثناء محاولة نسخ النتيجة. الرجاء المحاولة مرة أخرى.');
        }
    });
});
