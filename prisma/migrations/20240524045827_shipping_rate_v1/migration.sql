/*
  Warnings:

  - You are about to alter the column `zoneId` on the `ZoneShippingRate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ZoneShippingRate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rateProviderId" INTEGER,
    "zoneId" INTEGER,
    "rateTitle" TEXT,
    "rateSubtitle" TEXT,
    "shop" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ZoneShippingRate" ("createdAt", "id", "rateSubtitle", "rateTitle", "shop", "zoneId") SELECT "createdAt", "id", "rateSubtitle", "rateTitle", "shop", "zoneId" FROM "ZoneShippingRate";
DROP TABLE "ZoneShippingRate";
ALTER TABLE "new_ZoneShippingRate" RENAME TO "ZoneShippingRate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
