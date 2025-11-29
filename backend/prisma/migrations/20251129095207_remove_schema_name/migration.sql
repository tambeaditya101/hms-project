/*
  Warnings:

  - You are about to drop the column `schemaName` on the `Tenant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Tenant_schemaName_key";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "schemaName";
