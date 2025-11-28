// app/api/reservations/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Check if shop is accepting reservations (public endpoint)
export async function GET() {
  try {
    // Get the single shop settings record
    const shopSettings = await prisma.shopSettings.findUnique({
      where: { id: 'shop-settings' }
    });
    
    // Default to true if no settings exist yet
    const acceptingReservations = shopSettings?.acceptingReservations ?? true;

    return NextResponse.json({
      acceptingReservations,
      message: acceptingReservations 
        ? 'Shop is accepting reservations' 
        : 'Shop is currently full and not accepting new reservations',
    });

  } catch (error) {
    console.error('Error checking reservation status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update shop accepting reservations status (protected endpoint)
export async function PATCH(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { acceptingReservations } = body;

    // Validate input
    if (typeof acceptingReservations !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid input: acceptingReservations must be a boolean' },
        { status: 400 }
      );
    }

    console.log(`[Shop Status] Updating to: ${acceptingReservations} by user: ${user.id}`);

    // Update or create the single shop settings record
    const shopSettings = await prisma.shopSettings.upsert({
      where: { id: 'shop-settings' },
      update: {
        acceptingReservations,
        updatedBy: user.id,
        updatedAt: new Date(),
      },
      create: {
        id: 'shop-settings',
        acceptingReservations,
        updatedBy: user.id,
      },
    });

    console.log(`[Shop Status] Updated successfully: ${shopSettings.acceptingReservations}`);

    return NextResponse.json({
      success: true,
      acceptingReservations: shopSettings.acceptingReservations,
      message: acceptingReservations 
        ? 'Shop is now accepting reservations' 
        : 'Shop is no longer accepting reservations',
    });

  } catch (error) {
    console.error('Error updating shop status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}