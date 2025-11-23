import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const demoUserId = "59a0117e-6a1f-4564-8d7b-0d2fe4cfd28e";

  // Clear old data
  await prisma.orderStatusHistory.deleteMany();
  await prisma.order.deleteMany();

  const enumStatuses = ["RECEIVED", "IN_PROGRESS", "PICKUP", "COMPLETE"] as const;
  const now = new Date();
  const realisticHours = [2, 4, 12, 24];

  for (let i = 0; i < 10; i++) {
    const isBacklog = Math.random() < 0.3;
    const daysAgo = isBacklog
      ? Math.floor(Math.random() * 14) + 7 // 7–20 days ago
      : Math.floor(Math.random() * 7);     // 0–6 days ago

    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const trackId = `ORD-${Date.now()}-${i}`;

    // Determine final order status
    let maxStatusIndex: number;
    if (isBacklog) {
      maxStatusIndex = Math.floor(Math.random() * 2); // RECEIVED or IN_PROGRESS
    } else {
      const isComplete = Math.random() < 0.6;
      maxStatusIndex = isComplete ? enumStatuses.length - 1 : Math.floor(Math.random() * (enumStatuses.length - 1));
    }
    const status = enumStatuses[maxStatusIndex];

    // Flags for completed orders
    let completedWeek: number | null = null;
    let completedMonth: number | null = null;

    // Create the order first
    const order = await prisma.order.create({
      data: {
        userId: demoUserId,
        customerName: `Customer ${i + 1}`,
        customerNumber: `09${Math.floor(Math.random() * 900000000 + 100000000)}`,
        customerEmail: `customer${i + 1}@example.com`,
        trackId,
        price: Math.floor(Math.random() * 500) + 50,
        status,
        notes: `This is a note for order ${i + 1}`,
        createdAt,
      },
    });

    // Insert status history for this order
    let lastTimestamp = createdAt;

    for (let j = 0; j <= maxStatusIndex; j++) {
      let hoursToAdd = realisticHours[j];

      if (enumStatuses[j] === "COMPLETE") {
        // Simulate pickup delay
        hoursToAdd = Math.floor(Math.random() * 24) + 4; // 4–28 hours
        const potentialComplete = new Date(lastTimestamp.getTime() + hoursToAdd * 60 * 60 * 1000);
        lastTimestamp = potentialComplete > now ? randomTimeToday(now) : potentialComplete;

        // Set week/month flags
        completedWeek = getWeekNumber(lastTimestamp);
        completedMonth = lastTimestamp.getMonth() + 1;

        // Update order flags
        await prisma.order.update({
          where: { id: order.id },
          data: { completedWeek, completedMonth },
        });
      } else {
        const nextTimestamp = new Date(lastTimestamp.getTime() + Math.floor(Math.random() * hoursToAdd * 60 * 60 * 1000));
        lastTimestamp = nextTimestamp > now ? now : nextTimestamp;
      }

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: enumStatuses[j],
          timestamp: lastTimestamp,
        },
      });
    }
  }

  console.log("Seed data with realistic pickup delays and daily spread inserted!");
}

// Helper: get ISO week number
function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Helper: pick random time today up to current hour
function randomTimeToday(now: Date) {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const msSinceStart = now.getTime() - startOfDay.getTime();
  const randomOffset = Math.floor(Math.random() * msSinceStart);
  return new Date(startOfDay.getTime() + randomOffset);
}

// Run the script
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
