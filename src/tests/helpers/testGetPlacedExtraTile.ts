import { query } from "~/db";
import { type PlacedExtraTile } from "~/db/game";

type SqlLetterReturn = {
  id: string;
  letter: string;
  letter_index: number;
  is_used: boolean;
  game_id: string;
};

export async function testGetPlacedExtraTile(
  extraTileId: string,
  rowIndex: number,
  columnIndex: number,
) {
  const sqlExtraTileLetters = await query({
    text: "SELECT * FROM get_tile_letters($1)",
    values: [extraTileId],
  }) as SqlLetterReturn[];

  const sqlTileId = await query({
    text: "SELECT id FROM tile WHERE row_index=$1 AND column_index=$2",
    values: [rowIndex, columnIndex],
    rowMode: "array",
  }) as { id: string }[];
  const tileId = sqlTileId[0][0];

  const extraTile: PlacedExtraTile = {
    id: extraTileId,
    letters: sqlExtraTileLetters.map(l => {
      return {
        id: l.id,
        letter: l.letter,
        letterIndex: l.letter_index,
        isUsed: l.is_used,
      };
    }),
    tileId: tileId,
  };

  return extraTile;
}
