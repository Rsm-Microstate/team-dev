import Head from "next/head";
import { Search, ArrowRight, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>フリマ比較アプリ — 最安値を一目で</title>
        <meta
          name="description"
          content="複数のフリマサイトを横断検索して最安値を表示するWebアプリケーションのランディングページ"
        />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-slate-50">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b">
          <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="ロゴ" className="w-10 h-10 object-contain" />
              <h1 className="text-xl font-extrabold tracking-tight">
                フリマ比較アプリ
              </h1>
            </div>

            <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
              <a href="#features" className="hover:text-sky-600">
                機能
              </a>
              <a href="#how" className="hover:text-sky-600">
                使い方
              </a>
              <a href="#tech" className="hover:text-sky-600">
                技術
              </a>
              <a
                href="#"
                className="bg-sky-600 text-white px-5 py-2 rounded-full hover:bg-sky-700 transition"
              >
                デモを試す
              </a>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden px-3 py-2 border rounded-md">Menu</button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 w-full">
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
                    />
                  </div>
                  <button className="px-6 py-3 bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition flex items-center justify-center gap-2">
                    検索 <ArrowRight className="w-4 h-4" />
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
                    {
                      name: "iPhone 14 Pro（中古）",
                      site: "メルカリ",
                      price: "¥118,000",
                      link: "#",
                    },
                    {
                      name: "iPhone 14 Pro（中古）",
                      site: "ヤフオク",
                      price: "¥115,500",
                      link: "#",
                    },
                    {
                      name: "iPhone 14 Pro（中古）",
                      site: "ラクマ",
                      price: "¥119,800",
                      link: "#",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 flex items-center justify-between ${
                        i % 2 === 1 ? "bg-slate-50" : ""
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-700">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500">{item.site}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-sky-600">
                          {item.price}
                        </div>
                        <a
                          href={item.link}
                          className="text-xs text-blue-600 hover:underline"
                        >
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

          {/* Features */}
          <section
            id="features"
            className="max-w-7xl mx-auto px-6 py-20 text-center"
          >
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
              <a href="#" className="hover:underline">
                利用規約
              </a>
              <a href="#" className="hover:underline">
                プライバシー
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}