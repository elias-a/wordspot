import { For } from "solid-js";
import ExtraTileComponent from "~/components/ExtraTile";
import { ExtraTileRow } from "~/db/game";

type ExtraTileRowProps = {
  row: ExtraTileRow;
  disabled: boolean;
};

export default function ExtraTileRowComponent(props: ExtraTileRowProps) {
  return (
    <div class="extra-tile-row">
      <For each={props.row.tiles}>
        {tile => {
          return (
            <ExtraTileComponent
              tile={tile}
              disabled={props.disabled}
            />
          );
        }}
      </For>
    </div>
  );
}
