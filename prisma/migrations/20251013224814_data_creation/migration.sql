-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "isBotStoped" BOOLEAN NOT NULL,
    "wasWelcome" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_number_key" ON "user"("number");
