import { For } from "solid-js";
import Letter from "~/components/Letter";
import type { TileDimensions } from "~/db/game";

type TileProps = {
  dimensions: TileDimensions;
};

export default function Tile(props: TileProps) {
  return (
    <div
      class="tile"
      style={{
        "min-width": `${props.dimensions.width}px`,
        "max-width": `${props.dimensions.width}px`,
        "min-height": `${props.dimensions.height}px`,
        "max-height": `${props.dimensions.height}px`,
      }}
    >
      <For each={[1, 2, 3, 4]}>{() => {
        return <Letter dimensions={props.dimensions} />;
      }}</For>
    </div>
  );
}
