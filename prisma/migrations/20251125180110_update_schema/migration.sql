-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "acceptingReservations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reservationConfirmMessage" TEXT NOT NULL DEFAULT 'Hi {customerName},

Your laundry drop-off reservation has been confirmed!

Reservation Details:
• Reservation ID: {reservationId}
• Drop-off Date: {dropoffDate}
• Drop-off Time: {dropoffTime}

Please bring your laundry to our shop at the scheduled time. We''ll weigh your items and provide the total cost when you drop them off.

Thank you for choosing North End Laundry Shop!',
ADD COLUMN     "reservationConfirmSubject" TEXT NOT NULL DEFAULT 'Drop-off Reservation Confirmed - {reservationId}';

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerNumber" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "dropoffDate" TIMESTAMP(3) NOT NULL,
    "dropoffTime" TEXT NOT NULL,
    "specialInstructions" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reservationId_key" ON "Reservation"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_orderId_key" ON "Reservation"("orderId");

-- CreateIndex
CREATE INDEX "Reservation_reservationId_idx" ON "Reservation"("reservationId");

-- CreateIndex
CREATE INDEX "Reservation_customerEmail_idx" ON "Reservation"("customerEmail");

-- CreateIndex
CREATE INDEX "Reservation_status_dropoffDate_idx" ON "Reservation"("status", "dropoffDate");

-- CreateIndex
CREATE INDEX "Reservation_dropoffDate_idx" ON "Reservation"("dropoffDate");
