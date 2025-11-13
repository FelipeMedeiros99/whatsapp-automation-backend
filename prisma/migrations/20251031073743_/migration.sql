/*
  Warnings:

  - You are about to alter the column `restrictionNumber` on the `restrictions` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_restrictions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "restriction" TEXT,
    "restrictionNumber" DECIMAL
);
INSERT INTO "new_restrictions" ("id", "restriction", "restrictionNumber", "title") SELECT "id", "restriction", "restrictionNumber", "title" FROM "restrictions";
DROP TABLE "restrictions";
ALTER TABLE "new_restrictions" RENAME TO "restrictions";
CREATE UNIQUE INDEX "restrictions_title_key" ON "restrictions"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
