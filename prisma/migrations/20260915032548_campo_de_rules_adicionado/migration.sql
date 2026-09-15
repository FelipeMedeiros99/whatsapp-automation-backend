-- CreateTable
CREATE TABLE "bot_rules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rule" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "bot_rules_title_key" ON "bot_rules"("title");
