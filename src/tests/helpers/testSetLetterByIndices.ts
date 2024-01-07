import { query } from "~/db";

export async function testSetLetterByIndices(
  letter: string,
  rowIndex: number,
  columnIndex: number,
  letterIndex: number,
  gameId: string,
) {
  const sqlLetterId = await query({
    text: "SELECT * FROM set_letter_by_indices($1, $2, $3, $4, $5)",
    values: [letter, rowIndex, columnIndex, letterIndex, gameId],
    rowMode: "array",
  });

  return sqlLetterId[0][0];
}
