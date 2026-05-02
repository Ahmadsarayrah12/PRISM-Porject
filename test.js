const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.bbc.com/news/articles/c2d8dg57rzdo', { 
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } 
}).then(r => { 
    const $ = cheerio.load(r.data); 
    $('script, style, nav, header, footer, iframe, aside, .ads, .menu, noscript').remove(); 
    console.log($('body').text().substring(0, 500)); 
}).catch(e => console.log('Error:', e.message));
