import { Setter } from "solid-js";
import { createDraggable } from "@thisbeyond/solid-dnd";
import LetterRow from "~/components/LetterRow";
import type { ExtraTile } from "~/db/game";

type ExtraTileProps = {
  tile: ExtraTile;
  clicked: string[];
  setClicked: Setter<string[]>;
};

export default function ExtraTile(props: ExtraTileProps) {
  const draggable = createDraggable(props.tile.id);

  return (
    <div use:draggable id={props.tile.id} class="tile">
      <LetterRow
        letters={[props.tile.letters[0], props.tile.letters[1]]}
        clicked={props.clicked}
        setClicked={props.setClicked}
        disabled={true}
      />
      <LetterRow
        letters={[props.tile.letters[2], props.tile.letters[3]]}
        clicked={props.clicked}
        setClicked={props.setClicked}
        disabled={true}
      />
    </div>
  );
}
