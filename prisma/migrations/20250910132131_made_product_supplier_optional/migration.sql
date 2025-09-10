-- DropForeignKey
ALTER TABLE "public"."SupplierProduct" DROP CONSTRAINT "SupplierProduct_supplierId_fkey";

-- AlterTable
ALTER TABLE "public"."SupplierProduct" ALTER COLUMN "supplierId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."SupplierProduct" ADD CONSTRAINT "SupplierProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."SupplierProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
