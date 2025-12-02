import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - List blacklist entries (staff only)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await prisma.blacklistEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching blacklist entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Add a new blacklist entry (staff only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, value, reason } = body as {
      type?: "EMAIL" | "PHONE" | "IP";
      value?: string;
      reason?: string;
    };

    if (!type || !value) {
      return NextResponse.json(
        { error: "Type and value are required" },
        { status: 400 },
      );
    }

    const entry = await prisma.blacklistEntry.upsert({
      where: {
        type_value: {
          type,
          value,
        },
      },
      update: {
        active: true,
        reason,
        createdBy: user.id,
      },
      create: {
        type,
        value,
        reason,
        createdBy: user.id,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Error creating blacklist entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH - Toggle active state (staff only)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, active } = body as { id?: string; active?: boolean };

    if (!id || typeof active !== "boolean") {
      return NextResponse.json(
        { error: "id and active are required" },
        { status: 400 },
      );
    }

    const entry = await prisma.blacklistEntry.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Error updating blacklist entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}


