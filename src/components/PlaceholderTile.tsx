import type { TileDimensions } from "~/db/game";

type PlaceholderTileProps = {
  dimensions: TileDimensions;
};

export default function PlaceholderTile(props: PlaceholderTileProps) {
  return (
    <div
      class="placeholderTile" 
      style={{
        "min-width": `${props.dimensions.width}px`,
        "max-width": `${props.dimensions.width}px`,
        "min-height": `${props.dimensions.height}px`,
        "max-height": `${props.dimensions.height}px`,
      }}
    />
  );
}
