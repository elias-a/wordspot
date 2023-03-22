import { For, Setter } from "solid-js";
import { createServerData$ } from "solid-start/server";
import { createDroppable } from "@thisbeyond/solid-dnd";
import ExtraTileComponent from "~/components/ExtraTile";
import { updateBoard } from "~/db/game";
import type { Row, ExtraTile, PlacedExtraTile } from "~/db/game";

type UserAreaProps = {
  gameId: string;
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

  const endTurn = async () => {
    createServerData$(
      async ({ gameId, extraTile, board }) => await updateBoard(gameId, extraTile, board),
      { key: () => { return { gameId: props.gameId, extraTile: props.extraTile, board: props.board } } },
    );
  };

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
      <button name="start-game" onClick={endTurn} class="start-game-button">
        End Turn
      </button>
    </div>
  );
}
