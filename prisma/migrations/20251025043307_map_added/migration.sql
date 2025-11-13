/*
  Warnings:

  - You are about to drop the `GeminiRestriction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GeminiRestriction";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "gemini-restrictions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "restriction" TEXT NOT NULL
);
