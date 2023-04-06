import { Show } from "solid-js";
import { createDraggable } from "@thisbeyond/solid-dnd";
import type { ExtraTile } from "~/db/game";

type ExtraTileProps = {
  tile: ExtraTile;
  disabled: boolean;
};

function ExtraTileDetails(props: ExtraTileProps) {
  return (
    <>
      <div class="letter-row">
        <button class="letter" disabled={true}>
          {props.tile.letters[0].letter}
        </button>
        <button class="letter" disabled={true}>
          {props.tile.letters[1].letter}
        </button>
      </div>
      <div class="letter-row">
        <button class="letter" disabled={true}>
          {props.tile.letters[2].letter}
        </button>
        <button class="letter" disabled={true}>
          {props.tile.letters[3].letter}
        </button>
      </div>
    </>
  );
}

export default function ExtraTile(props: ExtraTileProps) {
  const draggable = createDraggable(props.tile.id);

  return (
    <Show
      when={!props.disabled}
      fallback={<div class="tile"><ExtraTileDetails {...props} /></div>}
    >
      <div use:draggable id={props.tile.id} class="tile">
        <ExtraTileDetails {...props} />
      </div>
    </Show>

  );
}
