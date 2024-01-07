import { type UserAccount } from "~/db/session";
import { startGame, getGame } from "~/db/game";

export async function testStartGame() {
  const user: UserAccount = {
    id: import.meta.env.VITE_TEST_USER1_ID,
    userName: import.meta.env.VITE_TEST_USER1_NAME,
    phone: import.meta.env.VITE_TEST_USER1_PHONE,
  };
  const gameId = await startGame(user);
  const { userData } = await getGame(gameId, user.id)

  return { 
    gameId,
    userId: user.id,
    userName: user.userName,
    playerId: userData.my_id,
  };
}
