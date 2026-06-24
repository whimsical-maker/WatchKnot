import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/checkAdmin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const isAdmin = await checkAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const movies = await prisma.movie.findMany({
      where: {
        title: { contains: search, mode: "insensitive" }
      },
      include: {
        addedBy: {
          select: { name: true, email: true, id: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ movies });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await checkAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { movieId } = await req.json();
    if (!movieId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.movie.delete({
      where: { id: movieId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
