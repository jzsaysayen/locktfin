// app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateReservationId } from '@/lib/idGenerator';

// Helper: extract IP address from request (works behind proxies)
function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || null;
  }
  // `request.ip` exists in some Next runtimes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyReq = request as any;
  return anyReq.ip ?? null;
}

// POST - Create new reservation (public endpoint)
export async function POST(request: NextRequest) {
  const attemptStartedAt = new Date();

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

    const ipAddress = getClientIp(request);

    // Validate required fields
    if (!customerName || !customerNumber || !customerEmail || !dropoffDate || !dropoffTime) {
      await prisma.reservationAttempt.create({
        data: {
          customerName,
          customerNumber,
          customerEmail,
          ipAddress,
          success: false,
          reason: 'MISSING_REQUIRED_FIELDS',
        },
      });

      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Check if reservations are being accepted using ShopSettings
    const shopSettings = await prisma.shopSettings.findUnique({
      where: { id: 'shop-settings' },
    });
    
    // Block if shop is not accepting reservations
    if (shopSettings && !shopSettings.acceptingReservations) {
      await prisma.reservationAttempt.create({
        data: {
          customerName,
          customerNumber,
          customerEmail,
          ipAddress,
          success: false,
          reason: 'SHOP_CLOSED',
        },
      });

      return NextResponse.json(
        { 
          error: 'Sorry, we are currently at full capacity and not accepting new reservations. Please try again later.',
          acceptingReservations: false,
        },
        { status: 403 },
      );
    }

    // 1) Blacklist checks (email / phone / IP) - FIXED TYPE ISSUE
    const blacklistConditions: Array<{ type: 'EMAIL' | 'PHONE' | 'IP'; value: string }> = [
      { type: 'EMAIL', value: customerEmail },
      { type: 'PHONE', value: customerNumber },
    ];

    if (ipAddress) {
      blacklistConditions.push({ type: 'IP', value: ipAddress });
    }

    const blacklistHit = await prisma.blacklistEntry.findFirst({
      where: {
        active: true,
        OR: blacklistConditions,
      },
    });

    if (blacklistHit) {
      await prisma.reservationAttempt.create({
        data: {
          customerName,
          customerNumber,
          customerEmail,
          ipAddress,
          success: false,
          reason: `BLACKLIST_${blacklistHit.type}`,
        },
      });

      return NextResponse.json(
        { error: 'You are not allowed to create a reservation at this time.' },
        { status: 403 },
      );
    }

    // 2) Rate limiting – 1 reservation per phone/email per 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentReservationsCount = await prisma.reservation.count({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
        OR: [
          { customerEmail },
          { customerNumber },
        ],
      },
    });

    if (recentReservationsCount >= 1) {
      await prisma.reservationAttempt.create({
        data: {
          customerName,
          customerNumber,
          customerEmail,
          ipAddress,
          success: false,
          reason: 'RATE_LIMIT_24H',
        },
      });

      return NextResponse.json(
        { error: 'Only one reservation per phone number or email is allowed every 24 hours.' },
        { status: 429 },
      );
    }

    // 3) Duplicate submission detection – same data, very close timestamps
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const dropoffDateObj = new Date(dropoffDate);

    const recentDuplicate = await prisma.reservation.findFirst({
      where: {
        customerEmail,
        customerNumber,
        dropoffDate: dropoffDateObj,
        dropoffTime,
        createdAt: { gte: tenMinutesAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentDuplicate) {
      await prisma.reservationAttempt.create({
        data: {
          customerName,
          customerNumber,
          customerEmail,
          ipAddress,
          success: false,
          reason: 'DUPLICATE_SUBMISSION',
        },
      });

      return NextResponse.json(
        {
          error: 'Duplicate reservation detected. A similar reservation was recently submitted.',
          existingReservation: recentDuplicate,
        },
        { status: 409 },
      );
    }

    // 4) Suspicious pattern detection – same IP, rapid submissions
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    let shouldFlagReservation = false;
    let flagReason: string | null = null;

    if (ipAddress) {
      const recentAttemptsFromIp = await prisma.reservationAttempt.count({
        where: {
          ipAddress,
          createdAt: { gte: fifteenMinutesAgo },
        },
      });

      // Threshold is arbitrary; tweak as needed
      if (recentAttemptsFromIp >= 5) {
        shouldFlagReservation = true;
        flagReason = 'RAPID_SUBMISSIONS_FROM_IP';
      }
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

    // 5) Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        reservationId,
        customerName,
        customerNumber,
        customerEmail,
        ipAddress,
        isFlagged: shouldFlagReservation,
        flagReason: flagReason,
        dropoffDate: dropoffDateObj,
        dropoffTime,
        specialInstructions: specialInstructions || null,
        status: 'PENDING',
      },
    });

    // Log successful attempt
    await prisma.reservationAttempt.create({
      data: {
        customerName,
        customerNumber,
        customerEmail,
        ipAddress,
        success: true,
        reason: shouldFlagReservation ? flagReason ?? 'OK_FLAGGED' : 'OK',
      },
    });

    // TODO: Send confirmation email

    return NextResponse.json({
      success: true,
      reservation,
      message: shouldFlagReservation
        ? 'Reservation created successfully and flagged for review.'
        : 'Reservation created successfully',
      createdAt: attemptStartedAt,
    });

  } catch (error) {
    console.error('Error creating reservation:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
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