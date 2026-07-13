'use strict';

const { json, readBody } = require('./_lib/http');

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 2 * 1024 * 1024;

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractMeta(html, attr, key) {
  const re1 = new RegExp('<meta[^>]+' + attr + '=["\']' + key + '["\'][^>]+content=["\']([^"\']*)["\']', 'i');
  const re2 = new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]+' + attr + '=["\']' + key + '["\']', 'i');
  const m = html.match(re1) || html.match(re2);
  return m ? decodeEntities(m[1].trim()) : null;
}

function extractTitleTag(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : null;
}

/* Best-effort "link preview" style parsing: fetch the listing URL server-side
   (browsers can't do this cross-origin) and read Open Graph meta tags, the
   same data most sites already publish for social-share previews. There's no
   per-site scraping logic — sites that block server fetches or don't set OG
   tags just come back as parsed:false, and the UI falls back to manual entry. */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const { url } = readBody(event);
  let parsed;
  try {
    parsed = new URL(String(url || '').trim());
  } catch (e) {
    return json(400, { error: 'Please paste a valid listing URL.' });
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return json(400, { error: 'Please paste a valid listing URL.' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(parsed.toString(), {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InvestorsAngelsLinkPreview/1.0; +https://i-angels.com)',
        'Accept': 'text/html'
      }
    });
    clearTimeout(timer);

    if (!res.ok || !res.body) {
      return json(200, {
        parsed: false,
        url: parsed.toString(),
        error: 'Could not read this link. Please fill in the details manually.'
      });
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let html = '';
    let received = 0;
    while (received < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      html += decoder.decode(value, { stream: true });
    }
    try { reader.cancel(); } catch (e) { /* best effort */ }

    const title = extractMeta(html, 'property', 'og:title') || extractTitleTag(html);
    const description = extractMeta(html, 'property', 'og:description') || extractMeta(html, 'name', 'description');
    const image = extractMeta(html, 'property', 'og:image');
    const price = extractMeta(html, 'property', 'product:price:amount') || extractMeta(html, 'property', 'og:price:amount');

    if (!title && !image && !description) {
      return json(200, {
        parsed: false,
        url: parsed.toString(),
        error: 'Could not read details from this link automatically. Please fill them in manually.'
      });
    }

    return json(200, {
      parsed: true,
      url: parsed.toString(),
      title: title || null,
      description: description || null,
      image: image || null,
      price: price || null
    });
  } catch (err) {
    clearTimeout(timer);
    return json(200, {
      parsed: false,
      url: parsed.toString(),
      error: 'Could not read this link automatically. Please fill in the details manually.'
    });
  }
};
