// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import prisma from "../../../../lib/prisma"; // ← ルート直下の lib/prisma.ts を参照

type UnifiedItem = {
  title: string;
  imageUrl?: string;
  price?: number;        // number: 円(ヤフオク) or ポンド(Books)を数値で。UIはそのまま表示
  source: "yahoo" | "books";
  productUrl?: string;
  currency: "JPY" | "GBP";
};

// ---- ヤフオクをスクレイピングして UnifiedItem[] に整形 ----
async function fetchYahooItems(keyword: string): Promise<UnifiedItem[]> {
  const url = `https://auctions.yahoo.co.jp/search/search?p=${encodeURIComponent(keyword)}&va=${encodeURIComponent(keyword)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`ヤフオクへのアクセスに失敗: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const items: UnifiedItem[] = [];

  $(".Product").each((_i, el) => {
    try {
      const $el = $(el);
      const title =
        $el.find(".Product__title").text().trim() ||
        $el.find("h3").text().trim();

      const imageUrl =
        $el.find(".Product__imageData img").attr("src") ||
        $el.find("img").first().attr("src") ||
        undefined;

      const priceText =
        $el.find(".Product__priceValue").first().text().trim() ||
        $el.find(".u-fs16").first().text().trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, ""), 10);
      const link = $el.find("a").attr("href") || undefined;

      if (title) {
        items.push({
          title,
          imageUrl,
          price: Number.isFinite(price) ? price : undefined, // 円
          source: "yahoo",
          productUrl: link,
          currency: "JPY", 
        });
      }
    } catch (e) {
      console.warn("yahoo item parse error:", e);
    }
  });

  return items;
}

// ---- Books(DB) を Prisma で検索して UnifiedItem[] に整形 ----
async function fetchBookItems(keyword: string): Promise<UnifiedItem[]> {
  const rows = await prisma.listing.findMany({
    where: {
      source: "books.toscrape",
      title: { contains: keyword }, // SQLite のため mode 指定は不可
    },
    orderBy: { priceMinorUnit: "asc" },
    take: 40,
    select: {
      title: true,
      imageUrl: true,
      priceMinorUnit: true,
      productUrl: true,
    },
  });

  // price は「£xx.yy」を number として返す (例: 12.34)
  return rows.map((r) => ({
    title: r.title,
    imageUrl: r.imageUrl ?? undefined,
    price: (r.priceMinorUnit ?? 0) / 100, // ポンド
    source: "books",
    productUrl: r.productUrl ?? undefined,
    currency: "GBP",
  }));
}

// ---- GET: 両サイトの結果を統合して返す（UIの期待スキーマ） ----
export async function GET(request: NextRequest) {
  try {
    const keyword = (request.nextUrl.searchParams.get("keyword") || "").trim();
    if (!keyword) {
      return NextResponse.json(
        { error: "検索キーワードが指定されていません" },
        { status: 400 }
      );
    }

    const [yahooItems, bookItems] = await Promise.all([
      fetchYahooItems(keyword).catch((e) => {
        console.warn("fetchYahooItems failed:", e);
        return [] as UnifiedItem[];
      }),
      fetchBookItems(keyword).catch((e) => {
        console.warn("fetchBookItems failed:", e);
        return [] as UnifiedItem[];
      }),
    ]);

    // 価格昇順（price が未定義は最後）
    const items = [...yahooItems, ...bookItems].sort((a, b) => {
      const ax = a.price ?? Number.POSITIVE_INFINITY;
      const bx = b.price ?? Number.POSITIVE_INFINITY;
      return ax - bx;
    });

    return NextResponse.json({
      total: items.length,
      items,
    });
  } catch (error) {
    console.error("統合検索エラー:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "統合検索に失敗しました" },
      { status: 500 }
    );
  }
}