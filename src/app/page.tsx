"use client";

import { useState } from "react";
import Head from "next/head";
import { Search, ArrowRight, Star } from "lucide-react";

interface AuctionItem {
  Title: string;
  Image?: string;
  CurrentPrice?: string;
  AuctionID: string;
}

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<AuctionItem[]>([]);
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
      const response = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "エラーが発生しました");
      }

      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const scrollToSearch = () => {
    const searchSection = document.getElementById("search-section");
    searchSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Head>
        <title>フリマヒカク — 最安値を一目で</title>
        <meta name="description" content="複数のフリマサイトを横断検索して最安値を表示するWebアプリケーション" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-slate-50">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b">
          <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold tracking-tight">
                フリマヒカク
              </h1>
            </div>
            <button className="md:hidden px-3 py-2 border rounded-md">Menu</button>
          </div>
        </header>

        <main className="flex-1 w-full">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-r from-sky-100 to-indigo-100 py-40">
            <div className="max-w-7xl mx-auto px-6 gap-12 flex items-center justify-center flex-col text-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-slate-800">
                  欲しい商品を、<span className="text-sky-600">最安値</span>で手に入れよう
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  trivagoのようにフリマを横断比較。メルカリ・ラクマ・ヤフオクから一括検索し、価格を見やすく並べて表示します。
                </p>
                <div className="mt-8 flex items-center justify-center sm:flex-row gap-3">
                  <div className="flex items-center w-full sm:w-[65%] bg-white rounded-full shadow px-4 py-2 border">
                    <Search className="w-5 h-5 text-slate-400 mr-2" />
                    <input
                      aria-label="検索キーワード"
                      placeholder="例：iPhone 14 Pro"
                      className="w-full outline-none"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    {loading ? "検索中..." : "検索"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 実際の検索セクション */}
          <section id="search-section" className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-extrabold text-slate-800">実際に検索してみる</h3>
              <p className="mt-2 text-slate-600">キーワードを入力してヤフオクの商品を検索できます</p>
            </div>

            {error && (
              <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {searched && !loading && items.length === 0 && !error && (
              <div className="text-center text-gray-600 py-12">
                <p className="text-lg">検索結果が見つかりませんでした</p>
                <p className="text-sm mt-2">別のキーワードで試してみてください</p>
              </div>
            )}

            {items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, index) => (
                  <div
                    key={`${item.AuctionID}-${index}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {item.Image ? (
                        <img
                          src={item.Image}
                          alt={item.Title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 h-10">
                        {item.Title}
                      </h3>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          {item.CurrentPrice ? (
                            <>
                              <div className="mb-1">
                                <p className="text-xs text-gray-500">現在価格</p>
                                <p className="text-lg font-bold text-sky-600">
                                  ¥{parseInt(item.CurrentPrice).toLocaleString()}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div>
                              <p className="text-xs text-gray-500">現在価格</p>
                              <p className="text-lg font-bold text-gray-400">価格不明</p>
                            </div>
                          )}
                        </div>
                        
                        <a
                          href={`https://page.auctions.yahoo.co.jp/jp/auction/${item.AuctionID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                        >
                          詳細
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="w-full border-t bg-white">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              © {new Date().getFullYear()} フリマヒカク
            </div>
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:underline">利用規約</a>
              <a href="#" className="hover:underline">プライバシー</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}