/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `rental_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('RENT', 'SECURITY_DEPOSIT', 'UTILITY', 'OTHER');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BDT',
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'RENT';

-- AlterTable
ALTER TABLE "rental_requests" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentId" TEXT;

-- CreateIndex
CREATE INDEX "payments_transactionId_idx" ON "payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "rental_requests_paymentId_key" ON "rental_requests"("paymentId");
