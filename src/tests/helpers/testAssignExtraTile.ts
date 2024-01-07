import { query } from "~/db";

export async function testAssignExtraTile(gameId: string, playerId: string) {
  const sqlExtraTileId = await query({
    text: "SELECT * FROM assign_extra_tile($1, $2)",
    values: [gameId, playerId],
    rowMode: "array",
  }) as [[string]];

  return { extraTileId: sqlExtraTileId[0][0] };
}
