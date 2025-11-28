// app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateReservationId } from '@/lib/idGenerator';

// POST - Create new reservation (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerNumber,
      customerEmail,
      dropoffDate,
      dropoffTime,
      specialInstructions,
    } = body;

    // Validate required fields
    if (!customerName || !customerNumber || !customerEmail || !dropoffDate || !dropoffTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // FIXED: Check if reservations are being accepted using ShopSettings
    const shopSettings = await prisma.shopSettings.findUnique({
      where: { id: 'shop-settings' },
    });
    
    // Block if shop is not accepting reservations
    if (shopSettings && !shopSettings.acceptingReservations) {
      return NextResponse.json(
        { 
          error: 'Sorry, we are currently at full capacity and not accepting new reservations. Please try again later.',
          acceptingReservations: false
        },
        { status: 403 }
      );
    }

    // Generate unique reservation ID
    let reservationId = generateReservationId();
    let exists = await prisma.reservation.findUnique({
      where: { reservationId },
    });

    // Keep generating until we get a unique one
    while (exists) {
      reservationId = generateReservationId();
      exists = await prisma.reservation.findUnique({
        where: { reservationId },
      });
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        reservationId,
        customerName,
        customerNumber,
        customerEmail,
        dropoffDate: new Date(dropoffDate),
        dropoffTime,
        specialInstructions: specialInstructions || null,
        status: 'PENDING',
      },
    });

    // TODO: Send confirmation email

    return NextResponse.json({
      success: true,
      reservation,
      message: 'Reservation created successfully',
    });

  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch reservations (protected for staff, or public by reservationId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservationId');
    const email = searchParams.get('email');

    // Public query by reservationId
    if (reservationId) {
      const reservation = await prisma.reservation.findUnique({
        where: { reservationId },
      });

      if (!reservation) {
        return NextResponse.json(
          { error: 'Reservation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ reservation });
    }

    // Public query by email (get all reservations for customer)
    if (email) {
      const reservations = await prisma.reservation.findMany({
        where: {
          customerEmail: email,
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
        orderBy: {
          dropoffDate: 'asc',
        },
      });

      return NextResponse.json({ 
        reservations,
        count: reservations.length 
      });
    }

    // Staff-only: Get all reservations
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const status = searchParams.get('status');
    type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    const whereClause = status ? { status: status as ReservationStatus } : undefined;
    
    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      orderBy: {
        dropoffDate: 'asc',
      },
    });

    return NextResponse.json({ 
      reservations,
      count: reservations.length 
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}