import { For, Setter } from "solid-js";
import { createDraggable } from "@thisbeyond/solid-dnd";
import Letter from "~/components/Letter";
import type { TileDimensions, Tile } from "~/db/game";

type ExtraTileProps = {
  tile: Tile;
  dimensions: TileDimensions;
  clicked: number[];
  setClicked: Setter<number[]>;
};

export default function ExtraTile(props: ExtraTileProps) {
  const draggable = createDraggable(props.tile.id);

  return (
    <div
      use:draggable
      class="extraTile" 
      style={{
        "min-width": `${props.dimensions.width}px`,
        "max-width": `${props.dimensions.width}px`,
        "min-height": `${props.dimensions.height}px`,
        "max-height": `${props.dimensions.height}px`,
      }}
    >
      <For each={props.tile.letters}>{letter => {
        return (
          <Letter
            letter={letter}
            dimensions={props.dimensions}
            clicked={props.clicked}
            setClicked={props.setClicked}
          />
        );
      }}</For>
    </div>
  );
}
