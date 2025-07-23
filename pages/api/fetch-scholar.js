import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import rateLimit from 'express-rate-limit';

puppeteer.use(StealthPlugin());

export const config = {
  api: { bodyParser: true },
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) =>
      result instanceof Error ? reject(result) : resolve(result)
    );
  });
}

// Utility to scroll page to trigger lazy-loading
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
}

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, limiter);
  } catch (err) {
    return res.status(429).json({ error: err.message });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { profileUrl } = req.body;

  if (!profileUrl || !profileUrl.includes('scholar.google.com')) {
    return res.status(400).json({ error: 'Missing or invalid Google Scholar URL' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      slowMo: 100,
      args: ['--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
    );

    await page.setViewport({ width: 1280, height: 800 });

    await page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.9',
    });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.goto(profileUrl, { waitUntil: 'networkidle2' }); // Wait for network to go idle

    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s to let dynamic JS load
    
    const htmlCheck = await page.content();
    if (htmlCheck.includes("The requested URL") && htmlCheck.includes("was not found on this server")) {
      await browser.close();
      return res.status(404).json({
        error: 'Google Scholar profile not found or is private.',   
        status: 404
      });
    }
    await page.screenshot({ path: 'scholar_debug.png', fullPage: true }); // to capture what the browser sees

    console.log('🌀 Scrolling page to load all publications...');
    await autoScroll(page);
    console.log('✅ Scroll complete');

    console.log('⏳ Waiting for publications to load...');
    await page.waitForSelector('.gsc_a_tr', { timeout: 30000 });
    console.log('✅ Publications loaded');


    const html = await page.content();
    console.log('📄 HTML length:', html.length);
    console.log('🔍 HTML Preview:', html.slice(0, 500)); // Optional debugging

    const $ = cheerio.load(html);

    // 📚 Publications
    const publications = [];
    $('.gsc_a_tr').each((_, el) => {
      const title = $(el).find('.gsc_a_at').text().trim();
      const href = $(el).find('.gsc_a_at').attr('href');
      const authors = $(el).find('.gsc_a_t div:nth-child(2)').text().trim();
      const year = $(el).find('.gsc_a_y .gsc_a_h').text().trim();

      if (title) {
        publications.push({
          title,
          link: href ? `https://scholar.google.com${href}` : '',
          authors,
          year,
        });
      }
    });

    // 📊 Citations
    const citations = $('#gsc_rsb_st td.gsc_rsb_std').first().text().trim() || '0';

    // 🎯 Interests
    const interests = [];
    $('.gsc_prf_inta').each((_, el) => {
      interests.push($(el).text().trim());
    });

    return res.status(200).json({ publications, citations, interests });
  } catch (err) {
    console.error('🔥 Scholar Scrape Error:', err);
    return res.status(500).json({ error: 'Scraping failed. Try again later.' });
  } finally {
    if (browser) await browser.close();
  }
}
