-- CreateTable
CREATE TABLE "ConfirmReservMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmReservMessage_text_key" ON "ConfirmReservMessage"("text");
