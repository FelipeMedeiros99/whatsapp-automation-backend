/*
  Warnings:

  - You are about to drop the `ConfirmReservMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ConfirmReservMessage";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "DefaultMessages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "key" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DefaultMessages_text_key" ON "DefaultMessages"("text");
