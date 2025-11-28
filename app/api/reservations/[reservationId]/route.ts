// app/api/reservations/[reservationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateTrackId } from "@/lib/idGenerator";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reservationId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { reservationId },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // If status is COMPLETED, create an order
    if (status === 'COMPLETED') {
      // Check if already completed
      if (reservation.status === 'COMPLETED') {
        return NextResponse.json(
          { error: 'Reservation already completed' },
          { status: 400 }
        );
      }

      // Generate unique track ID
      let trackId = generateTrackId();
      let exists = await prisma.order.findUnique({
        where: { trackId },
      });

      while (exists) {
        trackId = generateTrackId();
        exists = await prisma.order.findUnique({
          where: { trackId },
        });
      }

      // Create order from reservation
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          trackId,
          customerName: reservation.customerName,
          customerNumber: reservation.customerNumber,
          customerEmail: reservation.customerEmail,
          status: 'RECEIVED',
          price: 0, // Will be set when laundry is weighed
          notes: reservation.specialInstructions || null,
        },
      });

      // Create initial status history
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'RECEIVED',
        },
      });

      // Update reservation to COMPLETED and link to order
      const updatedReservation = await prisma.reservation.update({
        where: { reservationId },
        data: {
          status: 'COMPLETED',
          orderId: order.id,
        },
      });

      return NextResponse.json({ 
        success: true, 
        reservation: updatedReservation,
        order,
        message: 'Reservation completed and order created',
      });
    }

    // For other status updates (PENDING, CONFIRMED, CANCELLED)
    const updatedReservation = await prisma.reservation.update({
      where: { reservationId },
      data: { status },
    });

    // Send confirmation email when status changes to CONFIRMED
    if (status === 'CONFIRMED') {
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId: user.id },
      });

      if (userSettings?.resendApiKey && userSettings?.emailFromAddress) {
        try {
          // Format the drop-off date
          const dropoffDate = new Date(updatedReservation.dropoffDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          // Replace placeholders in email message
          const emailMessage = userSettings.reservationConfirmMessage
            .replace('{customerName}', updatedReservation.customerName)
            .replace('{reservationId}', updatedReservation.reservationId)
            .replace('{dropoffDate}', dropoffDate)
            .replace('{dropoffTime}', updatedReservation.dropoffTime);

          const emailSubject = userSettings.reservationConfirmSubject
            .replace('{reservationId}', updatedReservation.reservationId);

          // Send email using Resend
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userSettings.resendApiKey}`,
            },
            body: JSON.stringify({
              from: userSettings.emailFromAddress,
              to: updatedReservation.customerEmail,
              subject: emailSubject,
              text: emailMessage,
            }),
          });

          if (!resendResponse.ok) {
            console.error('Failed to send confirmation email');
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      reservation: updatedReservation 
    });

  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}