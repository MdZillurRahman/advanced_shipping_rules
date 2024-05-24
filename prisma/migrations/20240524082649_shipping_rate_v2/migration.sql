-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ZoneShippingRate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rateProviderId" TEXT,
    "zoneId" TEXT,
    "rateTitle" TEXT,
    "rateSubtitle" TEXT,
    "shop" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ZoneShippingRate" ("createdAt", "id", "rateProviderId", "rateSubtitle", "rateTitle", "shop", "zoneId") SELECT "createdAt", "id", "rateProviderId", "rateSubtitle", "rateTitle", "shop", "zoneId" FROM "ZoneShippingRate";
DROP TABLE "ZoneShippingRate";
ALTER TABLE "new_ZoneShippingRate" RENAME TO "ZoneShippingRate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
