import { For, Setter } from "solid-js";
import RowComponent from "~/components/Row";
import type { Row, PlacedExtraTile } from "~/db/game";

type BoardProps = {
  board: Row[];
  extraTile: PlacedExtraTile | undefined;
  clicked: string[]
  setClicked: Setter<string[]>;
  disabled: boolean;
};

export default function Board(props: BoardProps) {
  return (
    <div class="board">
      <For each={props.board}>
        {row => {
          return (
            <RowComponent
               row={row}
               extraTile={props.extraTile}
               clicked={props.clicked}
               setClicked={props.setClicked}
               disabled={props.disabled}
            />
          );
        }}
      </For>
    </div>
  );
}
