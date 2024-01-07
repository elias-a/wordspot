import { query } from "~/db";

export async function testSetLetterByTileId(
  letter: string,
  tileId: string,
  letterIndex: number,
) {
  const sqlLetterId = await query({
    text: "SELECT * FROM set_letter_by_tile_id($1, $2, $3)",
    values: [letter, tileId, letterIndex],
    rowMode: "array",
  });

  return sqlLetterId[0][0];
}
