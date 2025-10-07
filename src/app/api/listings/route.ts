// app/api/listings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { Prisma } from '@prisma/client';

function parseQuery(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || '').trim();
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || 20)));
  const sort = (searchParams.get('sort') || 'recent') as 'recent'|'price_asc'|'price_desc';
  return { q, category, page, pageSize, sort };
}

export async function GET(req: NextRequest) {
  const { q, category, page, pageSize, sort } = parseQuery(req);

  const where: any = { source: 'books.toscrape' };
  if (q) where.title = { contains: q };
  if (category) where.category = { equals: category };

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    sort === 'price_asc'
      ? { price: 'asc' }
      : sort === 'price_desc'
      ? { price: 'desc' }
      : { createdAt: 'desc' };

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, source: true, sourceId: true, title: true, category: true,
        price: true, priceMinorUnit: true, currency: true, inStock: true,
        rating: true, imageUrl: true, productUrl: true, createdAt: true, updatedAt: true,
      }
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({
    ok: true, total, page, pageSize, items
  });
}
