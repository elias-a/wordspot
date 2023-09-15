import { redirect } from "solid-start/server";
import { createCookieSessionStorage } from "solid-start/session";
import { v4 as uuidv4 } from "uuid";
import { pool, twilioClient } from ".";

export type UserAccount = {
  id: string;
  userName: string;
  phone: string;
};

const storage = createCookieSessionStorage({
  cookie: {
    name: "session",
    secure: process.env.NODE_ENV === "production",
    secrets: [import.meta.env.VITE_SESSION_SECRET],
    sameSite: "lax",
    path: "/",
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

  const client = await pool.connect();

  const user = await client.query({
    text: "SELECT id, user_name AS \"userName\", phone FROM user_account WHERE session_id=$1",
    values: [sessionId],
  }) as { rows: UserAccount[] };

  await client.release();

  if (user.rows.length !== 1) {
    return null;
  } else {
    return user.rows[0].id;
  }
}

export async function getUser(request: Request) {
  const sessionId = await getSessionId(request);
  if (!sessionId) {
    return null;
  }

  const client = await pool.connect();

  const user = await client.query({
    text: "SELECT id, user_name AS \"userName\", phone FROM user_account WHERE session_id=$1",
    values: [sessionId],
  }) as { rows: UserAccount[] };

  await client.release();

  if (user.rows.length !== 1) {
    throw logout(request);
  } else {
    return user.rows[0];
  }
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const phone = session.get("phone");

  const client = await pool.connect();

  await client.query({
    text: "UPDATE user_account SET unverified_id=$1, session_id=$2 WHERE phone=$3",
    values: [null, null, phone],
  });

  await client.release();

  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

async function sendVerification(phone: string) {
  return await twilioClient.verify.v2.services(import.meta.env.VITE_TWILIO_VERIFY_SID)
    .verifications.create({ to: `+1${phone}`, channel: "sms" })
    .then(res => res.sid)
    .catch(_err => {
      throw new Error(`Error logging in.`);
    });
}

async function checkVerification(phone: string, code: string) {
  await twilioClient.verify.v2.services(import.meta.env.VITE_TWILIO_VERIFY_SID)
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
    await twilioClient.verify.v2.services(import.meta.env.VITE_TWILIO_VERIFY_SID)
      .verifications(verificationSid).update({ status: "canceled" });
  } catch (_err) {
    // No need to cancel, verification code has already expired.
  }

  const client = await pool.connect();

  // Set user's unverified ID in the database to null.
  await client.query({
    text: "UPDATE user_account SET unverified_id=NULL WHERE phone=$1",
    values: [phone],
  });

  await client.release();

  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function createUserSession(request: Request, phone: string) {
  const session = await getUserSession(request);

  const client = await pool.connect();

  const user = await client.query({
    text: "SELECT id FROM user_account WHERE phone=$1",
    values: [phone],
  }) as { rows: UserAccount[] };

  const unverifiedId = uuidv4();
  if (user.rows.length === 1) {
    await client.query({
      text: "UPDATE user_account SET unverified_id=$1 WHERE phone=$2",
      values: [unverifiedId, phone],
    });
  } else {
    throw new Error(`Error logging in.`);
  }

  await client.release();

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

  const client = await pool.connect();

  // Check database to ensure the unverified user ID matches with the account.
  const id = await client.query({
    text: "SELECT id FROM user_account WHERE unverified_id=$1 AND phone=$2",
    values: [unverifiedId, phone],
  }) as string[];

  await client.release();

  if (id.length !== 1) {
    return null;
  }

  return unverifiedId;
}

export async function login(request: Request, code: string) {
  const session = await getUserSession(request);
  const phone = session.get("phone");

  await checkVerification(phone, code);

  const client = await pool.connect();

  const sessionId = uuidv4();
  await client.query({
    text: "UPDATE user_account SET unverified_id=$1, session_id=$2 WHERE phone=$3",
    values: [null, sessionId, phone],
  });

  await client.release();

  session.set("unverifiedId", undefined);
  session.set("sessionId", sessionId);

  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
