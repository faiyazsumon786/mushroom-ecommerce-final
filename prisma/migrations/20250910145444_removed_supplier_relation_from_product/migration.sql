/*
  Warnings:

  - You are about to drop the column `supplierId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_supplierId_fkey";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "supplierId";
