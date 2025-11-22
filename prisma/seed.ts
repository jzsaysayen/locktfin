import { PrismaClient } from "../generated/prisma/client";
const prisma = PrismaClient();
 
async function main() {
    const demoUserId = "clg6j3v3f0000l6mk6e4r4v6h"; // demo user id

    await prisma.order.createMany({
        data: Array.from({ length: 20 }).map((_, index) => ({
            userId: demoUserId,
            customerName: `Customer ${index + 1}`,
            customerNumber: `123-456-789${index}`,
            customerEmail: `customer${index + 1}@example.com`,
            trackId: `ORD${1000 + index}`,
            price: Math.floor(Math.random() * 500) + 50,
            status: ["Received", "Washing", "Drying", "Pickup", "Completed"][Math.floor(Math.random() * 5)],
            notes: `This is a note for order ${index + 1}`,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
        })),
    });


    console.log("Seed data inserted successfully.");
    console.log("Demo User ID:", demoUserId, " created 20 orders.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    }) 
    .finally(async () => {
        await prisma.$disconnect();
    });