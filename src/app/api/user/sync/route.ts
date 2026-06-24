import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const firebaseUser = await getAuthUser(req);
  if (!firebaseUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name, email, uid } = await req.json();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ user: existing });

    const user = await prisma.user.create({
      data: {
        id: uid,
        name,
        email,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ message: "Error syncing user" }, { status: 500 });
  }
}
