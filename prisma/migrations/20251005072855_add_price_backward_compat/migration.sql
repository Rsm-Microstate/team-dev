/*
  Warnings:

  - Added the required column `price` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "priceMinorUnit" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
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
INSERT INTO "new_Listing" ("attrs", "category", "createdAt", "currency", "description", "id", "imageUrl", "inStock", "priceMinorUnit", "productUrl", "rating", "source", "sourceId", "title", "updatedAt") SELECT "attrs", "category", "createdAt", "currency", "description", "id", "imageUrl", "inStock", "priceMinorUnit", "productUrl", "rating", "source", "sourceId", "title", "updatedAt" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE INDEX "Listing_category_priceMinorUnit_idx" ON "Listing"("category", "priceMinorUnit");
CREATE INDEX "Listing_title_idx" ON "Listing"("title");
CREATE UNIQUE INDEX "Listing_source_sourceId_key" ON "Listing"("source", "sourceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
