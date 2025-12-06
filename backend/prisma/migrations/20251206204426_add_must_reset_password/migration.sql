/*
  Warnings:

  - You are about to drop the column `isUsingTempPassword` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isUsingTempPassword",
ADD COLUMN     "mustResetPassword" BOOLEAN NOT NULL DEFAULT false;
