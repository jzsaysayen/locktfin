import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { resendApiKey, emailFromAddress, pickupEmailSubject, pickupEmailMessage } = body;

    // Update or create settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        resendApiKey: resendApiKey || null,
        emailFromAddress: emailFromAddress || null,
        pickupEmailSubject,
        pickupEmailMessage,
      },
      create: {
        userId: user.id,
        resendApiKey: resendApiKey || null,
        emailFromAddress: emailFromAddress || null,
        pickupEmailSubject,
        pickupEmailMessage,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}