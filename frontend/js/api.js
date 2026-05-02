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
