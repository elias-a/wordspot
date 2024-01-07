import { query } from "~/db";

export async function testSetPlayerTokens(tokens: number, playerId: number) {
  await query({
    text: "UPDATE player SET tokens=$1 WHERE id=$2",
    values: [tokens, playerId],
  });
}
