import { For, Setter } from "solid-js";
import { createDroppable } from "@thisbeyond/solid-dnd";
import ExtraTile from "~/components/ExtraTile";
import type { TileDimensions, Tile } from "~/db/game";

type UserAreaProps = {
  dimensions: TileDimensions;
  extraTiles: Tile[];
  extraTile: [number, number];
  clicked: number[];
  setClicked: Setter<number[]>;
};

export default function UserArea(props: UserAreaProps) {
  const droppable = createDroppable(100000);

  return (
    <div use:droppable class="user-area">
      <div  class="extra-tiles-area">
        <For each={props.extraTiles.filter(t => t.id !== props.extraTile[1])}>{tile => {
          return (
            <ExtraTile
              tile={tile}
              dimensions={props.dimensions}
              clicked={props.clicked}
              setClicked={props.setClicked}
            />
          );
        }}
        </For>
      </div>
    </div>
  );
}
