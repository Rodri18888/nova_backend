/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `stripeRefundId` on the `Sale` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Sale_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "stripePaymentIntentId",
DROP COLUMN "stripeRefundId";
