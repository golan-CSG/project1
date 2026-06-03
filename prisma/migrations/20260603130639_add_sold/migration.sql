-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "condition" TEXT NOT NULL,
    "location" TEXT,
    "imageUrl" TEXT,
    "images" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("brand", "category", "condition", "createdAt", "description", "email", "id", "imageUrl", "images", "location", "phone", "price", "title", "userId") SELECT "brand", "category", "condition", "createdAt", "description", "email", "id", "imageUrl", "images", "location", "phone", "price", "title", "userId" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
