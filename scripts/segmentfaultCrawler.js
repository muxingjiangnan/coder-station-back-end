const https = require('https');

const SEGMENTFAULT_URL = 'https://segmentfault.com/';
const MAX_ITEMS = 4;

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            if (res.statusCode !== 200) {
              return reject(new Error(`请求失败，状态码 ${res.statusCode}`));
            }
            resolve(body);
          });
        }
      )
      .on('error', reject);
  });
}

function normalizeText(text) {
  return text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function parseHotArticles(html) {
  const sectionIndex = html.indexOf('id="hotArticles"');
  if (sectionIndex === -1) {
    return [];
  }

  const snippet = html.slice(sectionIndex);
  const itemRegex = /<a[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*list-group-item[^"']*["'][^>]*>[\s\S]*?<span[^>]*badge[^>]*>(\d+)<\/span>[\s\S]*?<div[^>]*class=["']text-body["'][^>]*>([\s\S]*?)<\/div>/gi;

  const articles = [];
  let match;

  while (articles.length < MAX_ITEMS && (match = itemRegex.exec(snippet))) {
    const href = match[1].trim();
    const num = Number(match[2].trim());
    const title = normalizeText(match[3]);

    articles.push({
      num,
      title,
      href: href.startsWith('http') ? href : `https://segmentfault.com${href}`,
    });
  }

  return articles;
}

async function getSegmentFaultHotArticles() {
  const html = await fetchHtml(SEGMENTFAULT_URL);
  const articles = parseHotArticles(html);
  if (articles.length === 0) {
    throw new Error('未能解析到 SegmentFault 精彩文章列表');
  }
  return articles;
}

if (require.main === module) {
  getSegmentFaultHotArticles()
    .then((items) => {
      console.log(JSON.stringify(items, null, 2));
    })
    .catch((error) => {
      console.error('爬取失败：', error.message);
      process.exit(1);
    });
}

module.exports = {
  fetchHtml,
  parseHotArticles,
  getSegmentFaultHotArticles,
};
