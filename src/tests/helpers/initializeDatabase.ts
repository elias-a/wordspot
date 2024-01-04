import { query } from "~/db";
import { type UserAccount } from "~/db/session";
import { formatPostgresArray } from "~/utils/postgresFormatting";

export async function initializeDatabase() {
  const user1: UserAccount = {
    id: import.meta.env.VITE_TEST_USER1_ID,
    name: import.meta.env.VITE_TEST_USER1_NAME,
    phone: import.meta.env.VITE_TEST_USER1_PHONE,
  };
  const user2: UserAccount = {
    id: import.meta.env.VITE_TEST_USER2_ID,
    name: import.meta.env.VITE_TEST_USER2_NAME,
    phone: import.meta.env.VITE_TEST_USER2_PHONE,
  };

  await query({
    text: "SELECT load_users($1)",
    values: [formatPostgresArray([user1, user2])],
  });
}
