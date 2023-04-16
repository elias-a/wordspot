import { Setter } from "solid-js";
import { createDraggable } from "@thisbeyond/solid-dnd";
import LetterRow from "~/components/LetterRow";
import type { ExtraTile } from "~/db/game";

type PlacedExtraTileProps = {
  tile: ExtraTile;
  clicked: string[];
  setClicked: Setter<string[]>;
  selected: string[];
  setSelected: Setter<string[]>;
  hasTokensLeft: boolean;
};

export default function PlacedExtraTile(props: PlacedExtraTileProps) {
  const draggable = createDraggable(props.tile.id);

  return (
    <div
      use:draggable
      id={props.tile.id}
      class="tile"
      classList={{ "active-draggable-tile": draggable.isActiveDraggable }}
    >
      <LetterRow
        letters={[props.tile.letters[0], props.tile.letters[1]]}
        clicked={props.clicked}
        setClicked={props.setClicked}
        selected={props.selected}
        setSelected={props.setSelected}
        myTurn={true}
        hasTokensLeft={props.hasTokensLeft}
      />
      <LetterRow
        letters={[props.tile.letters[2], props.tile.letters[3]]}
        clicked={props.clicked}
        setClicked={props.setClicked}
        selected={props.selected}
        setSelected={props.setSelected}
        myTurn={true}
        hasTokensLeft={props.hasTokensLeft}
      />
    </div>
  );
}
