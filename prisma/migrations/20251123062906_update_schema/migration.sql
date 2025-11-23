-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resendApiKey" TEXT,
    "emailFromAddress" TEXT,
    "pickupEmailSubject" TEXT NOT NULL DEFAULT 'Your laundry is ready for pickup - Order {trackId}',
    "pickupEmailMessage" TEXT NOT NULL DEFAULT 'Hi {customerName},

Great news! Your laundry order is now ready for pickup.

Order Details:
• Tracking ID: {trackId}
• Total Amount: ₱{price}

Please bring your tracking ID when picking up your order.

You can track your order anytime at: {trackUrl}

Thank you for choosing LaundryLink!',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");
