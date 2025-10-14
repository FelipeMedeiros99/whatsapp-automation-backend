/*
  Warnings:

  - Added the required column `lastMessageFromBot` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "number" TEXT NOT NULL PRIMARY KEY,
    "timestamp" BIGINT NOT NULL,
    "isBotStoped" BOOLEAN NOT NULL,
    "wasWelcome" BOOLEAN NOT NULL,
    "lastMessageFromBot" BOOLEAN NOT NULL
);
INSERT INTO "new_user" ("isBotStoped", "number", "timestamp", "wasWelcome") SELECT "isBotStoped", "number", "timestamp", "wasWelcome" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_number_key" ON "user"("number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
