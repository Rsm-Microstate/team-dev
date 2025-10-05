// scripts/scrape-books.ts
import { chromium, Page, Browser } from 'playwright';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const BASE = 'https://books.toscrape.com/';

/** ---- Zod ---- */
const Product = z.object({
  source: z.literal('books.toscrape'),
  sourceId: z.string(),
  title: z.string(),
  category: z.string().optional(),
  priceMinorUnit: z.number().int().nonnegative(),
  price: z.number().int().nonnegative(),
  currency: z.literal('GBP'),
  inStock: z.boolean(),
  rating: z.number().int().min(0).max(5).optional(),
  imageUrl: z.string().url().optional(),
  productUrl: z.string().url(),
  description: z.string().optional(),
  attrs: z.record(z.unknown()).optional(),
});

/** ---- Utils ---- */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString().replace('T', ' ').replace('Z', '');
const log = (...args: any[]) => console.log(`[${now()}]`, ...args);
const warn = (...args: any[]) => console.warn(`[${now()}][warn]`, ...args);

async function safeGoto(page: Page, url: string, maxRetry = 3) {
  for (let i = 1; i <= maxRetry; i++) {
    try {
      log(`goto try=${i}/${maxRetry} url=${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      log(`goto ok url=${url}`);
      return;
    } catch (e: any) {
      warn(`goto failed try=${i} url=${url} msg=${e?.message ?? e}`);
      if (i === maxRetry) throw e;
      await sleep(500 * i); // バックオフ
    }
  }
}

function parseGBPToMinorUnit(raw: string | undefined): number | null {
  if (!raw) return null;
  const normalized = raw.replace(',', '.');
  const only = normalized.replace(/[^\d.]/g, '').trim();
  if (!only) return null;
  const m = only.match(/^\d+(?:\.\d+)?$/) || only.match(/\d+(?:\.\d+)?/);
  if (!m) return null;
  const num = Number(m[0]);
  if (!Number.isFinite(num)) return null;
  const pence = Math.round(num * 100);
  if (!Number.isInteger(pence) || pence < 0) return null;
  return pence;
}

function tableValue($$: cheerio.CheerioAPI, key: string): string | undefined {
  let hit: string | undefined;
  $$('table.table.table-striped tr').each((_, tr) => {
    const k = $$(tr).find('th').text().trim();
    const v = $$(tr).find('td').text().trim();
    if (!hit && k.toLowerCase() === key.toLowerCase()) hit = v;
  });
  return hit;
}

function absUrlMaybe(src: string | undefined, base: string): string | undefined {
  try { return src ? new URL(src, base).toString() : undefined; } catch { return undefined; }
}
function starRating(cls: string | undefined): number {
  const map = ['Zero','One','Two','Three','Four','Five'];
  if (!cls) return 0;
  const idx = map.findIndex(k => cls.includes(k));
  return Math.max(0, idx);
}

/** ---- Main ---- */
async function scrape() {
  log('scrape start');

  // Playwright 起動時点のログを出す
  log('launching chromium (headless)');
  const browser: Browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
    viewport: { width: 1365, height: 900 },
  });
  log('browser launched & page created');

  // BASE へ
  await safeGoto(page, BASE);
  log('loaded BASE, extracting categories...');
  let $ = cheerio.load(await page.content());
  const categories = $('ul.nav-list li ul li a').map((_, a) => ({
    name: $(a).text().trim(),
    url: new URL($(a).attr('href')!, BASE).toString(),
  })).get();
  log(`categories found: ${categories.length}`);

  let ok = 0, skipPrice = 0, skipError = 0;

  for (const cat of categories) {
    log(`category start: ${cat.name} url=${cat.url}`);
    let next = cat.url;

    while (next) {
      log(`list page: ${next}`);
      await safeGoto(page, next);
      $ = cheerio.load(await page.content());

      const detailUrls = $('article.product_pod h3 a')
        .map((_, a) => new URL($(a).attr('href')!, next).toString()).get();
      log(`products on page: ${detailUrls.length}`);

      for (const url of detailUrls) {
        try {
          await safeGoto(page, url);
          const $$ = cheerio.load(await page.content());

          const title = $$('div.product_main h1').text().trim();
          const rawPrimary = $$('p.price_color').first().text().trim();
          const rawAlt = $$('div.product_main .price_color').first().text().trim() || undefined;
          const rawIncl = tableValue($$, 'Price (incl. tax)');
          const rawExcl = tableValue($$, 'Price (excl. tax)');

          let pence =
            parseGBPToMinorUnit(rawPrimary) ??
            parseGBPToMinorUnit(rawAlt) ??
            parseGBPToMinorUnit(rawIncl) ??
            parseGBPToMinorUnit(rawExcl);

          if (pence === null) {
            skipPrice++;
            warn('[skip] price parse failed', { url, rawPrimary, rawAlt, rawIncl, rawExcl });
            continue;
          }

          const inStock = $$('p.instock.availability').text().includes('In stock');
          const rating = starRating($$('p.star-rating').attr('class'));
          const imageUrl = absUrlMaybe($$('div.item.active img').attr('src'), url);

          const attrs: Record<string, string> = {};
          $$('table.table.table-striped tr').each((_, tr) => {
            const k = $$(tr).find('th').text().trim();
            const v = $$(tr).find('td').text().trim();
            if (k && v) attrs[k] = v;
          });
          const sourceId = attrs['UPC'] ?? url;
          const description = $$('div#product_description').next('p').text().trim() || undefined;

          const data = Product.parse({
            source: 'books.toscrape',
            sourceId,
            title,
            category: cat.name,
            priceMinorUnit: pence,
            price: pence,
            currency: 'GBP',
            inStock,
            rating,
            imageUrl,
            productUrl: url,
            description,
            attrs,
          });

          await prisma.listing.upsert({
            where: { source_sourceId: { source: 'books.toscrape', sourceId } },
            update: { ...data, updatedAt: new Date() },
            create: data,
          });

          ok++;
          log(`saved: ${title} (${pence} pence)`);
          await sleep(200 + Math.random() * 300);
        } catch (e: any) {
          skipError++;
          warn('[skip] product error', { url, error: e?.message ?? e });
        }
      }

      const nextHref = $('li.next a').attr('href');
      next = nextHref ? new URL(nextHref, next).toString() : '';
      if (!next) log(`category end: ${cat.name}`);
    }
  }

  log(`[summary] ok=${ok} skipPrice=${skipPrice} skipError=${skipError}`);

  await page.close();
  await browser.close();
  await prisma.$disconnect();
  log('scrape done');
}

scrape().catch(async (e) => {
  console.error(`[${now()}][fatal] scrape failed`, e);
  await prisma.$disconnect();
  process.exit(1);
});