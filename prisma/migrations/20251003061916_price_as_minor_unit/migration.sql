-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "priceMinorUnit" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "inStock" BOOLEAN NOT NULL,
    "rating" INTEGER,
    "imageUrl" TEXT,
    "productUrl" TEXT NOT NULL,
    "description" TEXT,
    "attrs" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Listing_category_priceMinorUnit_idx" ON "Listing"("category", "priceMinorUnit");

-- CreateIndex
CREATE INDEX "Listing_title_idx" ON "Listing"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_source_sourceId_key" ON "Listing"("source", "sourceId");
