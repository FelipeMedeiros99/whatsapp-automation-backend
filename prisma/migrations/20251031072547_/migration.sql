/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `restrictions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "restrictions_title_key" ON "restrictions"("title");
