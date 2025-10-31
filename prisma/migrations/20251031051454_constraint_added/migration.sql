/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `vars` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "vars_title_key" ON "vars"("title");
