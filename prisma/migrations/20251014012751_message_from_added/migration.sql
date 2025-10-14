/*
  Warnings:

  - Added the required column `from` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from" TEXT NOT NULL,
    "userNumber" TEXT NOT NULL,
    CONSTRAINT "message_userNumber_fkey" FOREIGN KEY ("userNumber") REFERENCES "user" ("number") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_message" ("date", "id", "text", "userNumber") SELECT "date", "id", "text", "userNumber" FROM "message";
DROP TABLE "message";
ALTER TABLE "new_message" RENAME TO "message";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
