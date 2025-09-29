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
        <title>フリマ比較アプリ — 最安値を一目で</title>
        <meta name="description" content="複数のフリマサイトを横断検索して最安値を表示するWebアプリケーション" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-slate-50">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b">
          <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold tracking-tight">
                フリマ比較アプリ
              </h1>
            </div>
            <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
              <a href="#features" className="hover:text-sky-600">機能</a>
              <a href="#search-section" className="hover:text-sky-600">検索</a>
              <button
                onClick={scrollToSearch}
                className="bg-sky-600 text-white px-5 py-2 rounded-full hover:bg-sky-700 transition"
              >
                デモを試す
              </button>
            </nav>
            <button className="md:hidden px-3 py-2 border rounded-md">Menu</button>
          </div>
        </header>

        <main className="flex-1 w-full">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-r from-sky-100 to-indigo-100 py-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-slate-800">
                  欲しい商品を、<span className="text-sky-600">最安値</span>で手に入れよう
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  trivagoのようにフリマを横断比較。メルカリ・ラクマ・ヤフオクから一括検索し、価格を見やすく並べて表示します。
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
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
                <div className="mt-6 text-sm text-slate-600 flex flex-wrap gap-4">
                  <span className="flex items-center gap-1">✅ 複数サイト比較</span>
                  <span className="flex items-center gap-1">✅ 最安値順ソート</span>
                  <span className="flex items-center gap-1">✅ PC・スマホ対応</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border">
                <h3 className="font-semibold text-lg mb-4">検索結果プレビュー</h3>
                <div className="divide-y border rounded-lg overflow-hidden">
                  {[
                    { name: "iPhone 14 Pro（中古）", site: "メルカリ", price: "¥118,000", link: "#" },
                    { name: "iPhone 14 Pro（中古）", site: "ヤフオク", price: "¥115,500", link: "#" },
                    { name: "iPhone 14 Pro（中古）", site: "ラクマ", price: "¥119,800", link: "#" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 flex items-center justify-between ${
                        i % 2 === 1 ? "bg-slate-50" : ""
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-700">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.site}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-sky-600">{item.price}</div>
                        <a href={item.link} className="text-xs text-blue-600 hover:underline">
                          出品を見る
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  ※ これはデモです。実際には各サイトから取得した最新データを表示します。
                </p>
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
                          <p className="text-xs text-gray-500">現在価格</p>
                          <p className="text-lg font-bold text-sky-600">
                            {item.CurrentPrice ? `¥${parseInt(item.CurrentPrice).toLocaleString()}` : "価格不明"}
                          </p>
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

          {/* Features */}
          <section id="features" className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h3 className="text-3xl font-extrabold text-slate-800">主な機能</h3>
            <p className="mt-2 text-slate-600">
              シンプルかつ強力な比較機能で欲しい商品を見つけやすく。
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white rounded-xl shadow hover:shadow-lg transition">
                <Star className="w-8 h-8 text-sky-600 mx-auto" />
                <h4 className="mt-4 font-bold text-lg">横断検索</h4>
                <p className="mt-2 text-sm text-slate-600">
                  メルカリ・ラクマ・ヤフオクを同時に検索し、結果を統合表示します。
                </p>
              </div>
              <div className="p-8 bg-white rounded-xl shadow hover:shadow-lg transition">
                <Star className="w-8 h-8 text-sky-600 mx-auto" />
                <h4 className="mt-4 font-bold text-lg">最安値ソート</h4>
                <p className="mt-2 text-sm text-slate-600">
                  取得した商品の中から最安の商品を自動で上位に表示します。
                </p>
              </div>
              <div className="p-8 bg-white rounded-xl shadow hover:shadow-lg transition">
                <Star className="w-8 h-8 text-sky-600 mx-auto" />
                <h4 className="mt-4 font-bold text-lg">レスポンシブ対応</h4>
                <p className="mt-2 text-sm text-slate-600">
                  PC・スマホ・タブレットで見やすいUIを実現します。
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-sky-600 text-white py-16">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-2xl font-extrabold">開発を始めよう</h4>
                <p className="mt-2 text-sky-100">
                  GitHubからコードを取得し、すぐにチーム開発をスタートできます。
                </p>
              </div>
              <a
                href="#"
                className="bg-white text-sky-600 px-6 py-3 rounded-full font-semibold hover:bg-slate-100 transition"
              >
                GitHubへ
              </a>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="w-full border-t bg-white">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              © {new Date().getFullYear()} フリマ比較アプリ
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