/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventType` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industry` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestTags` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialMediaLinks` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Account_provider_providerAccountId_key";

-- DropIndex
DROP INDEX "Session_sessionToken_key";

-- DropIndex
DROP INDEX "VerificationToken_identifier_token_key";

-- DropIndex
DROP INDEX "VerificationToken_token_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Account";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Session";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VerificationToken";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "interestTags" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "capacity" INTEGER,
    "price" REAL,
    "location" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "logoUrl" TEXT,
    "videoUrl" TEXT,
    "website" TEXT,
    "socialMediaLinks" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactName" TEXT,
    "hostId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("bannerUrl", "createdAt", "description", "hostId", "id", "location", "logoUrl", "name", "updatedAt") SELECT "bannerUrl", "createdAt", "description", "hostId", "id", "location", "logoUrl", "name", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userType" TEXT NOT NULL DEFAULT 'GUEST',
    "jobTitle" TEXT,
    "industry" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "useGravatar" BOOLEAN NOT NULL DEFAULT false,
    "tagString" TEXT,
    "notifications" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "bannerUrl", "bio", "createdAt", "email", "id", "industry", "jobTitle", "name", "notifications", "password", "tagString", "updatedAt", "useGravatar", "userType") SELECT "avatarUrl", "bannerUrl", "bio", "createdAt", "email", "id", "industry", "jobTitle", "name", "notifications", "password", "tagString", "updatedAt", "useGravatar", "userType" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
