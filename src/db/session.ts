import { redirect } from "solid-start/server";
import { createCookieSessionStorage } from "solid-start/session";
import { v4 as uuidv4 } from "uuid";
import twilio from "twilio";
import { query } from ".";

const twilioClient = twilio(
  import.meta.env.VITE_TWILIO_ACCOUNT_SID,
  import.meta.env.VITE_TWILIO_AUTH_TOKEN,
);
const verifySid = import.meta.env.VITE_TWILIO_VERIFY_SID;

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

export async function getUserId(request: Request) {
  const sessionId = await getSessionId(request);
  if (!sessionId) {
    return null;
  }

  const user = await query({
    sql: "SELECT id, userName, phone FROM UserAccount WHERE sessionId=?",
    values: [sessionId],
  }) as UserAccount[];
  
  if (user.length !== 1) {
    return null;
  } else {
    return user[0].id;
  }
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
    throw logout(request);
  } else {
    return user[0];
  }
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const phone = session.get("phone");

  await query({
    sql: "UPDATE UserAccount SET unverifiedId=?, sessionId=? WHERE phone=?",
    values: [null, null, phone],
  });

  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

async function sendVerification(phone: string) {
  return await twilioClient.verify.v2.services(verifySid)
    .verifications.create({ to: `+1${phone}`, channel: "sms" })
    .then(res => res.sid)
    .catch(_err => {
      throw new Error(`Error logging in.`);
    });
}

async function checkVerification(phone: string, code: string) {
  await twilioClient.verify.v2.services(verifySid)
    .verificationChecks.create({ to: `+1${phone}`, code })
    .then(res => {
      if (!res.valid) {
        throw new Error(`Incorrect verification code.`);
      }
    }).catch(_err => {
      throw new Error(`Incorrect verification code`);
    });
}

export async function cancelVerification(request: Request) {
  const session = await getUserSession(request);
  const phone = session.get("phone");
  const verificationSid = session.get("verificationSid");
  if (!phone || !verificationSid) {
    throw new Error("Verification SID or phone is missing from the request headers.");
  }

  // Use Twilio API to cancel verification request.
  try {
    await twilioClient.verify.v2.services(verifySid)
      .verifications(verificationSid).update({ status: "canceled" });
  } catch (_err) {
    // No need to cancel, verification code has already expired.
  }

  // Set user's unverified ID in the database to null.
  await query({
    sql: "UPDATE UserAccount SET unverifiedId=NULL WHERE phone=?",
    values: [phone],
  });
  
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function createUserSession(phone: string) {
  const session = await storage.getSession();

  const user = await query({
    sql: "SELECT id FROM UserAccount WHERE phone=?",
    values: [phone],
  }) as UserAccount[];

  const unverifiedId = uuidv4();
  if (user.length === 1) {
    await query({
      sql: "UPDATE UserAccount SET unverifiedId=? WHERE phone=?",
      values: [unverifiedId, phone],
    });
  } else {
    throw new Error(`Error logging in.`);
  }

  const verificationSid = await sendVerification(phone);

  session.set("verificationSid", verificationSid);
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
  const id = await query({
    sql: "SELECT id FROM UserAccount WHERE unverifiedId=? AND phone=?",
    values: [unverifiedId, phone],
  }) as string[];

  if (id.length !== 1) {
    return null;
  }

  return unverifiedId;
}

export async function login(request: Request, code: string) {
  const session = await getUserSession(request);
  const phone = session.get("phone");

  await checkVerification(phone, code);

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
