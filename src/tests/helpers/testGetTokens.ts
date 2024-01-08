import { query } from "~/db";

export async function testGetTokens(playerId: string) {
  const sqlTokens = await query({
    text: "SELECT tokens FROM player WHERE id=$1",
    values: [playerId],
    rowMode: "array",
  }) as [[number]];

  return sqlTokens[0][0];
}
