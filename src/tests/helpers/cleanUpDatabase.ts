import { query } from "~/db";

export async function cleanUpDatabase() {
  await query({
    text: "SELECT clear_database()",
    values: [],
  });
}
