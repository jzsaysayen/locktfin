// app/api/reservations/stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get reservation statistics (public endpoint)
export async function GET() {
  try {
    // Get count of pending reservations
    const pendingCount = await prisma.reservation.count({
      where: {
        status: 'PENDING'
      }
    });

    // Get count of confirmed reservations
    const confirmedCount = await prisma.reservation.count({
      where: {
        status: 'CONFIRMED'
      }
    });

    // Get total active reservations (pending + confirmed)
    const activeCount = await prisma.reservation.count({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    return NextResponse.json({
      pendingCount,
      confirmedCount,
      activeCount,
      message: `${pendingCount} reservations pending confirmation`
    });

  } catch (error) {
    console.error('Error fetching reservation stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}