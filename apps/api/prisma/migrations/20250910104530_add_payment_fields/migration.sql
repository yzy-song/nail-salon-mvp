/*
  Warnings:

  - A unique constraint covering the columns `[paymentIntentId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "paymentStatus" TEXT DEFAULT 'unpaid';

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_paymentIntentId_key" ON "public"."Appointment"("paymentIntentId");
