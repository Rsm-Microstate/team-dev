// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { Search, ArrowRight } from "lucide-react";

interface UnifiedItem {
  title: string;
  imageUrl?: string;
  price?: number;
  source: "yahoo" | "books";
  productUrl?: string;
  currency?: string;
  // 円換算後の価格（計算時に付与）
  priceJPY?: number;
}

// 通貨換算レート（1ポンド = 約190円）
const GBP_TO_JPY = 190;

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  // 追加：フィルタ開閉
  const [showFilters, setShowFilters] = useState(false);

  // 価格フィルタ（空は無制限扱い）
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // スライダー状態（円基準）
  const [sliderMin, setSliderMin] = useState<number>(0);
  const [sliderMax, setSliderMax] = useState<number>(0);
  const [sliderUpper, setSliderUpper] = useState<number>(0); // 可動上限（データから動的決定）

  // ページネーション
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // すべてのアイテムを円換算して比較用フィールドを追加
  const normalizedItems = items.map((item) => {
    let priceJPY = 0;

    // ヤフオク
    if (item.currency === "JPY" || item.source === "yahoo") {
      priceJPY = Number(item.price || 0);
    }
    // BooksToScrape（ポンド）
    else if (item.currency === "GBP" || item.source === "books") {
      priceJPY = Number(item.price || 0) * GBP_TO_JPY;
    }

    return { ...item, priceJPY };
  });

  useEffect(() => {
    // データ内の最大価格(円換算)から上限を決定（千円刻みに切り上げ）
    const maxJPY = Math.max(0, ...normalizedItems.map(i => (Number.isFinite(i.priceJPY) ? i.priceJPY : 0)));
    const bound = Math.max(1000, Math.ceil(maxJPY / 1000) * 1000);
    setSliderUpper(bound);
    // 検索直後など、初期化（上限が変わったら全域に広げる）
    setSliderMin(0);
    setSliderMax(bound);
    setMinPrice("");
    setMaxPrice("");
  }, [items]); // itemsが更新されたら再計算

  // データや並び替え/フィルタ変更時は1ページ目に戻す
  useEffect(() => {
    setPage(1);
  }, [items, sortOrder, sliderMin, sliderMax]);

  const min = sliderMin ?? 0;
  const max = sliderMax > 0 ? sliderMax : Number.POSITIVE_INFINITY;

  const filteredItems = normalizedItems.filter((it) => {
    const p = Number.isFinite(it.priceJPY) ? it.priceJPY : Number.POSITIVE_INFINITY;
    return p >= min && p <= max;
  });

  // フィルタ後を昇順/降順で非破壊ソート
  const sortedItems = [...filteredItems].sort((a, b) => {
    const ax = Number.isFinite(a.priceJPY) ? a.priceJPY : Number.POSITIVE_INFINITY;
    const bx = Number.isFinite(b.priceJPY) ? b.priceJPY : Number.POSITIVE_INFINITY;
    return sortOrder === "asc" ? ax - bx : bx - ax;
  });

  // 総件数とページ分割
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, sortedItems.length);
  const pagedItems = sortedItems.slice(startIdx, endIdx);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim()) {
      setError("検索キーワードを入力してください");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setItems([]);

    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "検索に失敗しました");

      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>フリマヒカク — 横断検索</title>
        <meta name="description" content="ヤフオクとBooksToScrapeを横断検索して最安値を表示" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-slate-50">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b">
          <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
              フリマヒカク
            </h1>
          </div>
        </header>

        <main className="flex-1 w-full">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-r from-sky-100 to-indigo-100 py-32 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800">
              フリマを横断検索して、<span className="text-sky-600">最安値</span>を探そう
            </h2>

            <form onSubmit={handleSearch} className="mt-10 flex justify-center gap-3 max-w-2xl mx-auto px-4 flex-nowrap">
              <div className="flex items-center w-full bg-white rounded-full shadow px-4 py-2 border">
                <Search className="w-5 h-5 text-slate-400 mr-2" />
                <input
                  placeholder="例：Harry Potter"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full outline-none shrink-0"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition flex items-center justify-center whitespace-nowrap min-w-[96px]"
              >
                {loading ? "検索中..." : "検索"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </form>
          </section>

          {/* 検索結果表示 */}
          <section className="max-w-7xl mx-auto px-6 py-16">
            {error && (
              <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {searched && !loading && sortedItems.length === 0 && !error && (
              <div className="text-center text-gray-600 py-12">
                <p className="text-lg">検索結果が見つかりませんでした</p>
              </div>
            )}

            {sortedItems.length > 0 && (
              <>
                <div className="flex flex-col gap-4 mb-6">
                  {/* 上段：見出しと並び替え */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="text-2xl font-bold text-slate-800">
                      {keyword} の検索結果 ({sortedItems.length}件)
                    </h3>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600">並び替え:</span>
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                          className="border rounded-md px-3 py-2 bg-white"
                          aria-label="並び替え"
                        >
                          <option value="asc">価格が安い順</option>
                          <option value="desc">価格が高い順</option>
                        </select>
                      </label>

                      {/* 追加：絞り込みトグル */}
                      <button
                        type="button"
                        onClick={() => setShowFilters((v) => !v)}
                        className="text-sm px-3 py-2 border rounded-md bg-white hover:bg-slate-50"
                        aria-expanded={showFilters}
                        aria-controls="filter-panel"
                      >
                        {showFilters ? "絞り込みを閉じる" : "絞り込み"}
                      </button>
                    </div>
                  </div>

                  {/* 下段：価格フィルタ（デュアルレンジスライダー） */}
                  {showFilters && (
                    <div id="filter-panel" className="flex flex-col gap-3">
                    {/* スライダー本体 */}
                    <div className="relative w-full pt-2 pb-10">
                      {/* トラック */}
                      <div className="h-2 bg-slate-200 rounded-full" />
                      {/* 選択範囲のハイライト */}
                      <div
                        className="absolute left-0 top-2 -translate-y-1/2 h-2 bg-sky-400 rounded-full"
                        style={{
                          left: `${sliderUpper ? (sliderMin / sliderUpper) * 100 : 0}%`,
                          right: `${sliderUpper ? 100 - (sliderMax / sliderUpper) * 100 : 0}%`,
                        }}
                      />
                      {/* 左ハンドル */}
                      <input
                        type="range"
                        min={0}
                        max={sliderUpper || 0}
                        value={Math.min(sliderMin, sliderMax)}
                        onChange={(e) => {
                          const v = Math.min(Number(e.target.value), sliderMax);
                          setSliderMin(v);
                          setMinPrice(String(v));
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent thumb-only"
                        aria-label="最低価格スライダー"
                      />
                      {/* 右ハンドル */}
                      <input
                        type="range"
                        min={0}
                        max={sliderUpper || 0}
                        value={Math.max(sliderMax, sliderMin)}
                        onChange={(e) => {
                          const v = Math.max(Number(e.target.value), sliderMin);
                          setSliderMax(v);
                          setMaxPrice(String(v));
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent thumb-only"
                        aria-label="最高価格スライダー"
                      />
                      {/* 目盛表示 */}
                      <div className="mt-5 flex justify-between text-xs text-slate-600">
                        <span>¥{Math.round(sliderMin).toLocaleString()}</span>
                        <span>¥{Math.round(sliderMax).toLocaleString()}</span>
                      </div>
                    </div>
                    <style jsx>{`
                      /* 2本のrangeを重ねても、つまみ(thumb)だけがマウスイベントを受け取るようにする */
                      input[type='range'].thumb-only {
                        pointer-events: none;
                      }
                      input[type='range'].thumb-only::-webkit-slider-thumb {
                        pointer-events: auto;
                      }
                      input[type='range'].thumb-only::-moz-range-thumb {
                        pointer-events: auto;
                      }
                      /* 見た目の最小調整（必要なら） */
                      input[type='range'].thumb-only {
                        -webkit-appearance: none;
                        appearance: none;
                        height: 0; /* トラックは別要素で描画しているため0でOK */
                      }
                      input[type='range'].thumb-only::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 18px;
                        height: 18px;
                        border-radius: 9999px;
                        background: white;
                        border: 2px solid #0ea5e9; /* sky-500 */
                        box-shadow: 0 1px 2px rgba(0,0,0,0.15);
                      }
                      input[type='range'].thumb-only::-moz-range-thumb {
                        width: 18px;
                        height: 18px;
                        border-radius: 9999px;
                        background: white;
                        border: 2px solid #0ea5e9;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.15);
                      }
                    `}</style>

                    {/* 数値入力も併設（スライダーと双方向同期） */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-600 min-w-[72px]">価格帯:</label>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">¥</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={minPrice}
                          onChange={(e) => {
                            const v = Math.max(0, Number(e.target.value || 0));
                            setMinPrice(String(v));
                            setSliderMin(Math.min(v, sliderMax));
                          }}
                          placeholder="最小"
                          className="w-28 border rounded-md px-3 py-2 bg-white"
                          aria-label="最低価格(円)"
                        />
                        <span className="text-slate-400">〜</span>
                        <span className="text-slate-500 text-sm">¥</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={maxPrice}
                          onChange={(e) => {
                            const v = Math.max(0, Number(e.target.value || 0));
                            setMaxPrice(String(v));
                            setSliderMax(Math.max(v, sliderMin));
                          }}
                          placeholder="最大"
                          className="w-28 border rounded-md px-3 py-2 bg-white"
                          aria-label="最高価格(円)"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setMinPrice("");
                          setMaxPrice("");
                          setSliderMin(0);
                          setSliderMax(sliderUpper);
                        }}
                        className="text-sm px-3 py-2 border rounded-md bg-white hover:bg-slate-50"
                      >
                        フィルタをクリア
                      </button>

                      <div className="text-xs text-slate-500 ml-auto">
                        換算レート: 1 GBP ≈ ¥{GBP_TO_JPY}
                      </div>
                    </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {pagedItems.map((item, index) => (
                    <div
                      key={`${item.source}-${index}`}
                      className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
                    >
                      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">No Image</span>
                        )}
                        {/* 出典バッジ */}
                        <span
                          className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
                            item.source === "yahoo"
                              ? "bg-yellow-400 text-gray-800"
                              : "bg-sky-500 text-white"
                          }`}
                        >
                          {item.source === "yahoo" ? "ヤフオク" : "Books"}
                        </span>
                      </div>

                      <div className="p-4">
                        <h3 className="text-sm font-semibold mb-2 line-clamp-2 h-10 text-gray-800">
                          {item.title}
                        </h3>
                        <p className="text-lg font-bold text-sky-600 mb-3">
                          {item.price
                            ? item.currency === "GBP"
                              ? `¥${Math.round(item.priceJPY).toLocaleString()} (円換算済)`
                              : `¥${Math.round(item.price).toLocaleString()}`
                            : "価格不明"}
                        </p>
                        {item.productUrl && (
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center text-sm bg-sky-600 text-white py-2 rounded hover:bg-sky-700"
                          >
                            詳細を見る
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-600">
                    全{sortedItems.length}件中 {startIdx + 1}–{endIdx}件を表示
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-2 text-sm border rounded-md bg-white disabled:opacity-50"
                      aria-label="前のページ"
                    >
                      前へ
                    </button>
                    {/* 簡易ページ番号（最大5つまで表示） */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // 現在ページを中心にウィンドウを作成
                      const half = 2;
                      let start = Math.max(1, page - half);
                      let end = Math.min(totalPages, start + 4);
                      start = Math.max(1, end - 4);
                      const num = start + i;
                      if (num > totalPages) return null;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPage(num)}
                          className={`px-3 py-2 text-sm border rounded-md ${num === page ? "bg-sky-600 text-white border-sky-600" : "bg-white"}`}
                          aria-current={num === page ? "page" : undefined}
                        >
                          {num}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-2 text-sm border rounded-md bg-white disabled:opacity-50"
                      aria-label="次のページ"
                    >
                      次へ
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </>
  );
}