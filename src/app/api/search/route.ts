import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface ScrapedItem {
  Title: string;
  Image?: string;
  CurrentPrice?: string;
  AuctionID: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return NextResponse.json(
        { error: '検索キーワードが指定されていません' },
        { status: 400 }
      );
    }

    console.log('検索キーワード:', keyword);

    const searchUrl = `https://auctions.yahoo.co.jp/search/search?p=${encodeURIComponent(keyword)}&va=${encodeURIComponent(keyword)}`;
    
    console.log('スクレイピングURL:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      console.error('ヤフオクへのアクセスに失敗:', response.status);
      throw new Error(`ヤフオクへのアクセスに失敗しました: ${response.status}`);
    }

    const html = await response.text();
    console.log('HTML取得成功。サイズ:', html.length);

    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    $('.Product').each((index, element) => {
      try {
        const $item = $(element);
        
        const title = $item.find('.Product__title').text().trim() || 
                     $item.find('h3').text().trim();
        
        const imageUrl = $item.find('.Product__imageData img').attr('src') || 
                        $item.find('img').first().attr('src');
        
        const priceText = $item.find('.Product__priceValue').first().text().trim() ||
                         $item.find('.u-fs16').first().text().trim();
        const price = priceText.replace(/[^0-9]/g, '');
        
        const link = $item.find('a').attr('href');
        const auctionId = link ? link.match(/[a-z][0-9]+/)?.[0] || `scraped_${index}` : `scraped_${index}`;

        if (title) {
          items.push({
            Title: title,
            Image: imageUrl,
            CurrentPrice: price || undefined,
            AuctionID: auctionId,
          });
        }
      } catch (err) {
        console.error('アイテムのパースエラー:', err);
      }
    });

    console.log('スクレイピング成功。取得件数:', items.length);

    if (items.length === 0) {
      console.log('アイテムが見つかりませんでした。HTML構造が変更された可能性があります。');
    }

    return NextResponse.json({
      items: items.slice(0, 40),
      total: items.length.toString(),
    });

  } catch (error) {
    console.error('スクレイピングエラー:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'スクレイピングに失敗しました',
      },
      { status: 500 }
    );
  }
}