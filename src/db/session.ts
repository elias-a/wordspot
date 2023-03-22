import { redirect } from "solid-start/server";
import { createCookieSessionStorage } from "solid-start/session";
import { v4 as uuidv4 } from "uuid";
import { query } from ".";

export type UserAccount = {
  id: string;
  userName: string;
  phone: string;
};

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session", // TODO: Fix
    secure: true,
    secrets: ["hello"], // TODO: Fix
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getSessionId(request: Request) {
  const session = await getUserSession(request);
  const sessionId = session.get("sessionId");
  if (!sessionId || typeof sessionId !== "string") return null;
  return sessionId;
}

export async function getUser(request: Request) {
  const sessionId = await getSessionId(request);
  if (!sessionId) {
    return null;
  }

  const user = await query({
    sql: "SELECT id, userName, phone FROM UserAccount WHERE sessionId=?",
    values: [sessionId],
  }) as UserAccount[];
  
  if (user.length !== 1) {
    //throw logout(request);
  } else {
    return user[0];
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

export async function createUserSession(phone: string, request: Request) {
  const session = await storage.getSession();

  const user = await query({
    sql: "SELECT id FROM UserAccount WHERE phone=?",
    values: [phone],
  }) as UserAccount[];

  const unverifiedId = uuidv4();
  if (user) {
    await query({
      sql: "UPDATE UserAccount SET unverifiedId=?",
      values: [unverifiedId],
    });
  } else {
    // Do not allow user to create an account.
    return null;
  }

  session.set("unverifiedId", unverifiedId);
  session.set("phone", phone);
  return redirect("/verify", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getUnverifiedUser(request: Request) {
  const session = await getUserSession(request);
  const unverifiedId = session.get("unverifiedId");
  const phone = session.get("phone");
  if (
    !unverifiedId ||
    typeof unverifiedId !== "string" ||
    !phone ||
    typeof phone !== "string"
  ) {
    return null;
  }

  // Check database to ensure the unverified user ID matches with the account.
  await query({
    sql: "SELECT id FROM UserAccount WHERE unverifiedId=? AND phone=?",
    values: [unverifiedId, phone],
  });

  return unverifiedId;
}

export async function login(request: Request, code: string) {
  const session = await getUserSession(request);
  const phone = session.get("phone");



  const sessionId = uuidv4();
  await query({
    sql: "UPDATE UserAccount SET unverifiedId=?, sessionId=? WHERE phone=?",
    values: [null, sessionId, phone],
  });

  session.set("unverifiedId", undefined);
  session.set("sessionId", sessionId);

  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
