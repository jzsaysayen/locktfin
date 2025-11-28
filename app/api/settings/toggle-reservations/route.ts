// app/api/settings/toggle-reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST - Toggle accepting reservations (staff only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { acceptingReservations } = await request.json();

    if (typeof acceptingReservations !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid value for acceptingReservations' },
        { status: 400 }
      );
    }

    // Update or create user settings
    const userSettings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        acceptingReservations,
      },
      create: {
        userId: user.id,
        acceptingReservations,
      },
    });

    return NextResponse.json({
      success: true,
      acceptingReservations: userSettings.acceptingReservations,
      message: acceptingReservations 
        ? 'Now accepting reservations' 
        : 'Reservations disabled',
    });

  } catch (error) {
    console.error('Error toggling reservations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}