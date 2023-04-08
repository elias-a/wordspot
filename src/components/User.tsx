import { For, Setter, Switch, Match } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import { FormError } from "solid-start/data";
import { createDroppable } from "@thisbeyond/solid-dnd";
import ExtraTileRowComponent from "~/components/ExtraTileRow";
import { endTurn } from "~/db/game";
import type { Row, ExtraTile, UserData, ExtraTileRow } from "~/db/game";
import { v4 as uuidv4 } from "uuid";

type UserAreaProps = {
  gameId: string;
  userData: UserData;
  board: Row[];
  extraTiles: ExtraTile[];
  extraTile: ExtraTile | undefined;
  clicked: string[];
  setClicked: Setter<string[]>;
  setExtraTile: Setter<ExtraTile | undefined>;
};

export default function User(props: UserAreaProps) {
  const droppable = createDroppable("extra-tiles-area");
  const extraTileRows = () => {
    const userExtraTiles = props.extraTile
      ? props.extraTiles.filter(t => t.id !== props.extraTile!.id)
      : props.extraTiles;
    const rows: ExtraTileRow[] = [];

    for (let i = 0; i < userExtraTiles.length; i += 2) {
      rows.push({
        id: uuidv4(),
        tiles: userExtraTiles.slice(i, i + 2),
      });
    }
    
    return rows;
  };
  const [_, { Form }] = createServerAction$(async (form: FormData) => {
    const formGameId = form.get("gameId");
    const formPlayerId = form.get("playerId");
    const formClicked = form.get("clicked");
    const formExtraTile = form.get("extraTile");
    const formBoard = form.get("board");
    
    if (
      typeof formGameId !== "string" ||
      typeof formPlayerId !== "string" ||
      typeof formClicked !== "string" ||
      typeof formExtraTile !== "string" ||
      typeof formBoard !== "string"
    ) {
      throw new FormError(`Form not submitted correctly.`);
    }

    const gameId = formGameId;
    const playerId = formPlayerId;
    const clicked = JSON.parse(formClicked);
    const extraTile = formExtraTile !== "undefined"
      ? JSON.parse(formExtraTile)
      : undefined;
    const board = JSON.parse(formBoard);

    await endTurn(gameId, playerId, clicked, extraTile, board);
  });

  return (
    <div class="user-area">
      <div class="user-data">
        <div class="user-turn-section">
          <Switch>
            <Match when={props.userData.winner === props.userData.myId}>
              {`You won!`}
            </Match>
            <Match when={props.userData.winner}>
              {`You lost!`}
            </Match>
            <Match when={props.userData.myTurn}>
              {`Your turn!`}
            </Match>
            <Match when={props.userData.opponentTurn}>
              {`${props.userData.opponentName}'s Turn!`}
            </Match>
          </Switch>
        </div>
        <div class="user-token-section">
          <Switch>
            <Match when={props.userData.firstPlayer === props.userData.myId}>
              <div class="user-tokens">
                {`${props.userData.myName} has ${props.userData.myTokens - props.clicked.length} ${(props.userData.myTokens - props.clicked.length) === 1 ? "token" : "tokens"} left`}
              </div>
              <div class="user-tokens">
                {`${props.userData.opponentName} has ${props.userData.opponentTokens} ${props.userData.opponentTokens === 1 ? "token" : "tokens"} left`}
              </div>
            </Match>
            <Match when={props.userData.firstPlayer !== props.userData.myId}>
            <div class="user-tokens">
              {props.userData.opponentName}
            </div>
            <div class="user-tokens">
              {props.userData.opponentTokens}
            </div>
            <div class="user-tokens">
              {props.userData.myName}
            </div>
            <div class="user-tokens">
              {props.userData.myTokens}
            </div>
            </Match>
          </Switch>
        </div>
      </div>
      <div use:droppable id="extra-tiles-area" class="extra-tiles-area">
        <For each={extraTileRows()}>{row => {
          return (
            <ExtraTileRowComponent
              row={row}
              disabled={props.userData.winner !== null}
            />
          );
        }}</For>
      </div>
      <Form>
        <input
          type="hidden"
          name="gameId"
          value={props.gameId}
        />
        <input
          type="hidden"
          name="playerId"
          value={props.userData.playerId}
        />
        <input
          type="hidden"
          name="clicked"
          value={JSON.stringify(props.clicked)}
        />
        <input
          type="hidden"
          name="extraTile"
          value={props.extraTile ? JSON.stringify(props.extraTile) : undefined}
        />
        <input
          type="hidden"
          name="board"
          value={JSON.stringify(props.board)}
        />
        <button name="start-game" type="submit" class="end-turn-button">
          End Turn
        </button>
      </Form>
    </div>
  );
}
