import { redirect } from "solid-start/server";
import { createCookieSessionStorage } from "solid-start/session";
import { db } from ".";

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: true,
    secrets: ["hello"],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await db.user.findUnique({ where: { id: Number(userId) } });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function createUserSession() {
  const session = await storage.getSession();
  session.set("unverifiedId", "123456");
  return redirect("/verify", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getUnverifiedUser(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("unverifiedId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function login(request: Request) {
  const session = await getUserSession(request);
  session.set("unverifiedId", undefined);
  session.set("userId", "0");
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
