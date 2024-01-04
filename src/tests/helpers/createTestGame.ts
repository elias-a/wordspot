import { type UserAccount } from "~/db/session";
import { startGame, getGame } from "~/db/game";

// Create game to prime database for tests.
export async function createTestGame() {
  const user: UserAccount = {
    id: import.meta.env.VITE_TEST_USER1_ID,
    userName: import.meta.env.VITE_TEST_USER1_NAME,
    phone: import.meta.env.VITE_TEST_USER1_PHONE,
  };
  const gameId = await startGame(user);
  const { board, userData } = await getGame(gameId, user.id);

  return { gameId, board, userData };
}
