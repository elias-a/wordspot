import { query } from "~/db";

export async function testGetNumExtraTiles(playerId: string) {
  const sqlTileIds = await query({
    text: "SELECT id FROM tile WHERE tile_type='Extra' AND owner_id=$1",
    values: [playerId],
    rowMode: "array",
  });

  return sqlTileIds.length;
}
