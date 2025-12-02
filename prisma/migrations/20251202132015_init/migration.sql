-- CreateEnum
CREATE TYPE "BlacklistType" AS ENUM ('EMAIL', 'PHONE', 'IP');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ReservationAttempt" (
    "id" TEXT NOT NULL,
    "customerName" TEXT,
    "customerNumber" TEXT,
    "customerEmail" TEXT,
    "ipAddress" TEXT,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlacklistEntry" (
    "id" TEXT NOT NULL,
    "type" "BlacklistType" NOT NULL,
    "value" TEXT NOT NULL,
    "reason" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlacklistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationAttempt_customerEmail_createdAt_idx" ON "ReservationAttempt"("customerEmail", "createdAt");

-- CreateIndex
CREATE INDEX "ReservationAttempt_customerNumber_createdAt_idx" ON "ReservationAttempt"("customerNumber", "createdAt");

-- CreateIndex
CREATE INDEX "ReservationAttempt_ipAddress_createdAt_idx" ON "ReservationAttempt"("ipAddress", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistEntry_type_value_key" ON "BlacklistEntry"("type", "value");

-- CreateIndex
CREATE INDEX "Reservation_customerNumber_idx" ON "Reservation"("customerNumber");

-- CreateIndex
CREATE INDEX "Reservation_ipAddress_idx" ON "Reservation"("ipAddress");

-- CreateIndex
CREATE INDEX "Reservation_isFlagged_idx" ON "Reservation"("isFlagged");
