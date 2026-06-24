import { adminAuth } from "@/lib/firebase-admin";
import { NextRequest } from "next/server";

export async function getAuthUser(req: NextRequest | Request) {
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return null;

    const token = authorization.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };
  } catch {
    return null;
  }
}
