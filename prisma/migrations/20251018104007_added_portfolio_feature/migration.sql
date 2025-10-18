-- DropForeignKey
ALTER TABLE "public"."PortfolioImage" DROP CONSTRAINT "PortfolioImage_articleId_fkey";

-- AlterTable
ALTER TABLE "public"."PortfolioArticle" ALTER COLUMN "id" SET DEFAULT 'main_portfolio';

-- AddForeignKey
ALTER TABLE "public"."PortfolioImage" ADD CONSTRAINT "PortfolioImage_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."PortfolioArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
