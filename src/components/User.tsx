import { For, Setter } from "solid-js";
import { createDroppable } from "@thisbeyond/solid-dnd";
import ExtraTileComponent from "~/components/ExtraTile";
import type { ExtraTile } from "~/db/game";

type UserAreaProps = {
  extraTiles: ExtraTile[];
  extraTile: ExtraTile | undefined;
  clicked: string[]
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
    </div>
  );
}
