import { For } from "solid-js";
import Letter from "~/components/Letter";

type TileProps = {
  width: string;
  height: string;
};

export default function Tile(props: TileProps) {
  return (
    <div
      class="tile"
      style={{
        'min-width': props.width,
        'max-width': props.width,
        'min-height': props.height,
        'max-height': props.height,
      }}
    >
      <For each={[1, 2, 3, 4]}>{() => <Letter />}</For>
    </div>
  );
}
