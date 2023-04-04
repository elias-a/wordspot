import { APIEvent, json } from "solid-start/api";
import { endTurn } from "~/db/game";
import type { Row, PlacedExtraTile } from "~/db/game";

type EndTurnPostBody = {
  gameId: string;
  playerId: string;
  clicked: string[];
  // TODO: Check type
  extraTile: PlacedExtraTile | undefined;
  board: Row[];
};

export async function POST({ request }: APIEvent) {
  const {
    gameId,
    playerId,
    clicked,
    extraTile,
    board,
  } = await request.json() as EndTurnPostBody;

  await endTurn(gameId, playerId, clicked, extraTile, board);
  return json({});
}
