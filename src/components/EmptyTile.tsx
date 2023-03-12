import type { TileDimensions } from "~/db/game";

type EmptyTileProps = {
  dimensions: TileDimensions;

};

export default function EmptyTile(props: EmptyTileProps) {
  return (
      <div
        class="emptyTile" 
        style={{
          "min-width": `${props.dimensions.width}px`,
          "max-width": `${props.dimensions.width}px`,
          "min-height": `${props.dimensions.height}px`,
          "max-height": `${props.dimensions.height}px`,
        }}
      >Blank</div>
  );
}
