/*
  Warnings:

  - The `size` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `color` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "material" TEXT[],
ADD COLUMN     "type" TEXT,
DROP COLUMN "size",
ADD COLUMN     "size" TEXT[],
DROP COLUMN "color",
ADD COLUMN     "color" TEXT[];
