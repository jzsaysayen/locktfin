// app/api/orders/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendPickupNotification } from '@/lib/email';

type OrderStatus = 'RECEIVED' | 'IN_PROGRESS' | 'PICKUP' | 'COMPLETE';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, status, price } = await request.json();

    // Validate required fields
    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: OrderStatus[] = ['RECEIVED', 'IN_PROGRESS', 'PICKUP', 'COMPLETE'];
    if (!validStatuses.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const newStatus = status as OrderStatus;

    // Check if order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this order' },
        { status: 403 }
      );
    }

    // Validate price if status is PICKUP
    if (newStatus === 'PICKUP') {
      if (!price || price <= 0) {
        return NextResponse.json(
          { error: 'Valid price is required when marking order ready for pickup' },
          { status: 400 }
        );
      }
    }

    // Prepare update data - price is required in schema so we need to handle it carefully
    const updateData: {
      status: OrderStatus;
      price?: number;
      statusHistory: {
        create: {
          status: OrderStatus;
          timestamp: Date;
        };
      };
    } = {
      status: newStatus,
      statusHistory: {
        create: {
          status: newStatus,
          timestamp: new Date(),
        },
      },
    };

    // Add price if provided (required for PICKUP status)
    if (price !== undefined && price !== null && price > 0) {
      updateData.price = Math.round(price * 100) / 100; // Round to 2 decimal places
    }

    // Update order status and create status history
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        statusHistory: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    // TODO: Send email notification to customer if status is PICKUP
    if (newStatus === 'PICKUP') {
      // Fetch user settings
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId: user.id },
      });

      if (userSettings?.resendApiKey && userSettings?.emailFromAddress) {
        const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${updatedOrder.trackId}`;
        
        const emailResult = await sendPickupNotification(
          {
            customerName: updatedOrder.customerName,
            customerEmail: updatedOrder.customerEmail,
            trackId: updatedOrder.trackId,
            price: updatedOrder.price,
            trackUrl,
          },
          {
            resendApiKey: userSettings.resendApiKey,
            emailFromAddress: userSettings.emailFromAddress,
            pickupEmailSubject: userSettings.pickupEmailSubject,
            pickupEmailMessage: userSettings.pickupEmailMessage,
          }
        );

        if (!emailResult.success) {
          console.error('Failed to send email notification:', emailResult.error);
          // Don't fail the whole request if email fails
          return NextResponse.json({
            success: true,
            order: updatedOrder,
            message: 'Order status updated successfully, but email notification failed to send',
            emailError: emailResult.error,
          });
        }

        console.log('Email notification sent successfully');
      } else {
        console.log('Email settings not configured - skipping notification');
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order status updated successfully',
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}