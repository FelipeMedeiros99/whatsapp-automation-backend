/*
  Warnings:

  - You are about to drop the column `userId` on the `message` table. All the data in the column will be lost.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user` table. All the data in the column will be lost.
  - Added the required column `userNumber` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "userNumber" TEXT NOT NULL,
    CONSTRAINT "message_userNumber_fkey" FOREIGN KEY ("userNumber") REFERENCES "user" ("number") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_message" ("id", "text") SELECT "id", "text" FROM "message";
DROP TABLE "message";
ALTER TABLE "new_message" RENAME TO "message";
CREATE TABLE "new_user" (
    "number" TEXT NOT NULL PRIMARY KEY,
    "timestamp" BIGINT NOT NULL,
    "isBotStoped" BOOLEAN NOT NULL,
    "wasWelcome" BOOLEAN NOT NULL
);
INSERT INTO "new_user" ("isBotStoped", "number", "timestamp", "wasWelcome") SELECT "isBotStoped", "number", "timestamp", "wasWelcome" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_number_key" ON "user"("number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
