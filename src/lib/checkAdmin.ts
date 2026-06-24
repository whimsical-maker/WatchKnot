import { getAuthUser } from "./getAuthUser";
import { prisma } from "./prisma";

export async function checkAdmin(req: Request) {
  const firebaseUser = await getAuthUser(req);
  if (!firebaseUser?.email) return false;

  if (firebaseUser.email === "labonysur473@gmail.com") return true;

  const user = await prisma.user.findUnique({
    where: { email: firebaseUser.email },
    select: { isAdmin: true }
  });

  return user?.isAdmin === true;
}
