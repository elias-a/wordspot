import { query } from "~/db";

export async function testGetWinner(gameId: string) {
  const sqlWinner = await query({
    text: "SELECT winner FROM game WHERE id=$1",
    values: [gameId],
    rowMode: "array",
  }) as [[string]];

  return sqlWinner[0][0];
}
