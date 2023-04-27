import mysql from "mysql2";
import { promisify } from "util";
import twilio from "twilio";

const connection = mysql.createConnection(import.meta.env.VITE_DATABASE_CONNECTION);
export const query = promisify(connection.query).bind(connection);

export const twilioClient = twilio(
  import.meta.env.VITE_TWILIO_ACCOUNT_SID,
  import.meta.env.VITE_TWILIO_AUTH_TOKEN,
);

