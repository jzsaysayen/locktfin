-- DropIndex
DROP INDEX "Order_createdAt_idx";

-- DropIndex
DROP INDEX "OrderStatusHistory_orderId_idx";

-- DropIndex
DROP INDEX "OrderStatusHistory_timestamp_idx";

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_timestamp_idx" ON "OrderStatusHistory"("orderId", "timestamp");
