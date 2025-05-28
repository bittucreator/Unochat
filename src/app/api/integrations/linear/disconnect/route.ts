import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Disconnect Linear integration for the authenticated user
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Remove Linear token from user in DB
  await prisma.user.update({
    where: { email: session.user.email },
    data: { linearToken: null },
  });
  return NextResponse.json({ success: true });
}
