import { For, Setter } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import { FormError } from "solid-start/data";
import { createDroppable } from "@thisbeyond/solid-dnd";
import ExtraTileComponent from "~/components/ExtraTile";
import { endTurn } from "~/db/game";
import type { Row, ExtraTile, PlacedExtraTile, UserData } from "~/db/game";

type UserAreaProps = {
  gameId: string;
  userData: UserData;
  board: Row[];
  extraTiles: ExtraTile[];
  extraTile: PlacedExtraTile | undefined;
  clicked: string[];
  setClicked: Setter<string[]>;
};

export default function User(props: UserAreaProps) {
  const droppable = createDroppable("extra-tiles-area");
  const userExtraTiles = () => {
    if (props.extraTile) {
      return props.extraTiles.filter(t => t.id !== props.extraTile!.id);
    } else {
      return props.extraTiles;
    }
  };
  const [_, { Form }] = createServerAction$(async (form: FormData) => {
    const formGameId = form.get("gameId");
    const formClicked = form.get("clicked");
    const formExtraTile = form.get("extraTile");
    const formBoard = form.get("board");
    
    if (
      typeof formGameId !== "string" ||
      typeof formClicked !== "string" ||
      typeof formExtraTile !== "string" ||
      typeof formBoard !== "string"
    ) {
      throw new FormError(`Form not submitted correctly.`);
    }

    const gameId = formGameId;
    const clicked = JSON.parse(formClicked);
    const extraTile = formExtraTile !== "undefined"
      ? JSON.parse(formExtraTile)
      : undefined;
    const board = JSON.parse(formBoard);

    await endTurn(gameId, clicked, extraTile, board);
  });

  return (
    <div class="user-area">
      <div use:droppable id="extra-tiles-area" class="extra-tiles-area">
        <For each={userExtraTiles()}>{tile => {
          return (
            <div class="extra-tile-container">
              <ExtraTileComponent
                tile={tile}
                clicked={props.clicked}
                setClicked={props.setClicked}
              />
            </div>
          );
        }}
        </For>
      </div>
      <div class="user-data">
        <div class="user-token-section">
          <div class="user-tokens">{props.userData.myTokens}</div>
          <div class="user-tokens">{props.userData.opponentTokens}</div>
        </div>
      </div>
      <Form>
        <input
          type="hidden"
          name="gameId"
          value={props.gameId}
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
        <button name="start-game" type="submit" class="start-game-button">
          End Turn
        </button>
      </Form>
    </div>
  );
}
