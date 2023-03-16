import { For, Setter } from "solid-js";
import RowComponent from "~/components/Row";
import type { Row, ExtraTile } from "~/db/game";

type BoardProps = {
  board: Row[];
  extraTile: ExtraTile | undefined;
  clicked: string[]
  setClicked: Setter<string[]>;
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
            />
          );
        }}
      </For>
    </div>
  );
}
