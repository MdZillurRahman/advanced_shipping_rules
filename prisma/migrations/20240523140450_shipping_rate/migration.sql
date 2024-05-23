-- CreateTable
CREATE TABLE "ZoneShippingRate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "zoneId" TEXT,
    "rateTitle" TEXT,
    "rateSubtitle" TEXT,
    "shop" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
