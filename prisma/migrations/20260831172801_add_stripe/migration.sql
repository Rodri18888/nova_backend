/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeRefundId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Sale_stripePaymentIntentId_key" ON "Sale"("stripePaymentIntentId");
