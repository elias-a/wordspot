import { getGame } from "~/db/game";

export async function testCheckBoard(
  gameId: string,
  userId: string,
  clicked: string[],
) {
  const { board } = await getGame(gameId, userId);
  const boardClicked = new Set<string>();

  board.forEach(row => {
    row.tiles.forEach(tile => {
      tile.letters.forEach(letter => {
        if (letter.isUsed) {
          boardClicked.add(letter.id);
        }
      });
    });
  });

  let ok = true;
  clicked.forEach(letter => {
    if (!boardClicked.has(letter)) {
      ok = false;
    }
  });

  return ok;
}
