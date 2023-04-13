import { Show } from "solid-js";
import { createDraggable } from "@thisbeyond/solid-dnd";
import ExtraTileDetails from "~/components/ExtraTileDetails";
import type { ExtraTile } from "~/db/game";

type ExtraTileProps = {
  tile: ExtraTile;
  disabled: boolean;
};

export default function ExtraTile(props: ExtraTileProps) {
  const draggable = createDraggable(props.tile.id);

  return (
    <Show
      when={!props.disabled}
      fallback={<div class="tile"><ExtraTileDetails {...props} /></div>}
    >
      <div
        use:draggable
        id={props.tile.id}
        class="tile"
        classList={{ "active-draggable-tile": draggable.isActiveDraggable }}
      >
        <ExtraTileDetails {...props} />
      </div>
    </Show>
  );
}
