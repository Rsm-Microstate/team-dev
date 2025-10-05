// src/app/page.tsx
"use client";

import { useState } from "react";
import Head from "next/head";
import { Search, ArrowRight } from "lucide-react";

interface UnifiedItem {
  title: string;
  imageUrl?: string;
  price?: number;
  source: "yahoo" | "books";
  productUrl?: string;
}

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

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

            <form onSubmit={handleSearch} className="mt-10 flex justify-center gap-3 max-w-2xl mx-auto px-4">
              <div className="flex items-center w-full bg-white rounded-full shadow px-4 py-2 border">
                <Search className="w-5 h-5 text-slate-400 mr-2" />
                <input
                  placeholder="例：Harry Potter"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition flex items-center"
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

            {searched && !loading && items.length === 0 && !error && (
              <div className="text-center text-gray-600 py-12">
                <p className="text-lg">検索結果が見つかりませんでした</p>
              </div>
            )}

            {items.length > 0 && (
              <>
                <h3 className="text-center text-2xl font-bold text-slate-800 mb-10">
                  {keyword} の検索結果 ({items.length}件)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {items.map((item, index) => (
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
                          ? `${item.currency === "GBP" ? "£" : "¥"}${item.price.toLocaleString()}`
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
              </>
            )}
          </section>
        </main>
      </div>
    </>
  );
}