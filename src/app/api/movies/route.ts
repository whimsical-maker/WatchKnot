import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const movies = await prisma.movie.findMany({
    where: { addedById: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ movies });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { title, year, genre, posterUrl, rating, description } = await req.json();

  if (!title) return NextResponse.json({ message: "Title is required" }, { status: 400 });

  const movie = await prisma.movie.create({
    data: {
      title,
      year: year ? parseInt(year) : null,
      genre: genre || null,
      posterUrl: posterUrl || null,
      rating: rating ? parseFloat(rating) : null,
      description: description || null,
      addedById: session.user.id,
    },
  });

  return NextResponse.json({ movie }, { status: 201 });
}
