export const processTextAPI = async (endpoint, text, options = {}, file = null) => {
    let response;
    
    if (endpoint === 'audio-analysis' || file) {
        const formData = new FormData();
        formData.append('endpoint', endpoint);
        if (text) formData.append('text', text);
        formData.append('options', JSON.stringify(options));
        if (file) formData.append('media', file);
        
        response = await fetch(`/api/audio`, {
            method: 'POST',
            body: formData
        });
    } else {
        response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, options })
        });
    }

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ في الاتصال بالخادم.');
    }
    
    return data;
};

/**
 * Streaming version — يستقبل أجزاء النص تدريجياً عبر SSE.
 * يستخدم للأدوات التي تُرجع Markdown فقط: summarize, recycle, synthesis, audio-analysis.
 *
 * @param {string} endpoint
 * @param {string} text
 * @param {object} options
 * @param {File|null} file
 * @param {(fullText: string) => void} onChunk — يُستدعى مع النص التراكمي عند كل جزء
 * @returns {Promise<{type:string, result:string, reportId:string|null}>}
 */
export const processTextAPIStream = async (endpoint, text, options = {}, file = null, onChunk = () => {}) => {
    let response;

    if (endpoint === 'audio-analysis' || file) {
        const formData = new FormData();
        if (text) formData.append('text', text);
        formData.append('options', JSON.stringify(options));
        if (file) formData.append('media', file);

        response = await fetch('/api/audio/stream', {
            method: 'POST',
            body: formData
        });
    } else {
        response = await fetch(`/api/${endpoint}/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, options })
        });
    }

    if (!response.ok) {
        let errMsg = `HTTP ${response.status}`;
        try {
            const data = await response.json();
            errMsg = data.error || errMsg;
        } catch { /* ignore */ }
        throw new Error(errMsg);
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer     = '';
    let fullResult = '';
    let reportId   = null;
    let type       = 'markdown';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
            const line = event.trim();
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;

            let data;
            try { data = JSON.parse(payload); }
            catch { continue; }

            if (data.error) throw new Error(data.error);
            if (data.chunk) {
                fullResult += data.chunk;
                onChunk(fullResult);
            } else if (data.done) {
                reportId = data.reportId;
                if (data.type) type = data.type;
            }
        }
    }

    return { type, result: fullResult, reportId };
};

export const scrapeUrlAPI = async (url) => {
    const response = await fetch(`/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'فشل جلب النص');
    return data;
};
