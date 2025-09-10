/*
  Warnings:

  - Made the column `supplierId` on table `SupplierProduct` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."SupplierProduct" DROP CONSTRAINT "SupplierProduct_supplierId_fkey";

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "shortDescription" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."SupplierProduct" ALTER COLUMN "supplierId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."SupplierProduct" ADD CONSTRAINT "SupplierProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."SupplierProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
