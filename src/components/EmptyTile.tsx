import { createDroppable } from "@thisbeyond/solid-dnd";
import type { TileDimensions } from "~/db/game";

type EmptyTileProps = {
  id: number;
  dimensions: TileDimensions;
};

export default function EmptyTile(props: EmptyTileProps) {
  const droppable = createDroppable(props.id);

  return (
    <div
      use:droppable
      class="emptyTile" 
      style={{
        "min-width": `${props.dimensions.width}px`,
        "max-width": `${props.dimensions.width}px`,
        "min-height": `${props.dimensions.height}px`,
        "max-height": `${props.dimensions.height}px`,
      }}
    />
  );
}
