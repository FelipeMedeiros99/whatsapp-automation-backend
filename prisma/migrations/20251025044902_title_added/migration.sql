/*
  Warnings:

  - Added the required column `title` to the `gemini-restrictions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_gemini-restrictions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "restriction" TEXT NOT NULL
);
INSERT INTO "new_gemini-restrictions" ("id", "restriction") SELECT "id", "restriction" FROM "gemini-restrictions";
DROP TABLE "gemini-restrictions";
ALTER TABLE "new_gemini-restrictions" RENAME TO "gemini-restrictions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
