type PlaceholderTileProps = {
  width: string;
  height: string;
};

export default function PlaceholderTile(props: PlaceholderTileProps) {
  return (
      <div
        class="placholderTile" 
        style={{
          "min-width": props.width,
          "max-width": props.width,
          "min-height": props.height,
          "max-height": props.height,
        }}
      >Placeholder</div>
  );
}
