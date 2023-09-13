import { Pool } from "pg";
import { promisify } from "util";
import twilio from "twilio";

export const pool = new Pool({
  host: import.meta.env.VITE_DATABASE_HOST,
  user: import.meta.env.VITE_DATABASE_USER,
  password: import.meta.env.VITE_DATABASE_PASSWORD,
  database: import.meta.env.VITE_DATABASE_NAME,
});

export const twilioClient = twilio(
  import.meta.env.VITE_TWILIO_ACCOUNT_SID,
  import.meta.env.VITE_TWILIO_AUTH_TOKEN,
);

