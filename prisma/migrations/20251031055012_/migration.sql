/*
  Warnings:

  - You are about to drop the `gemini-restrictions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vars` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "gemini-restrictions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "vars";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "restrictions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "restriction" TEXT,
    "restrictionNumber" INTEGER
);
