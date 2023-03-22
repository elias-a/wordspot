import mysql from "mysql2";
import { promisify } from "util";

const connection = mysql.createConnection(import.meta.env.VITE_DATABASE_CONNECTION);
export const query = promisify(connection.query).bind(connection);
