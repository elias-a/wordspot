type EmptyTileProps = {
  width: string;
  height: string;
};

export default function EmptyTile(props: EmptyTileProps) {
  return (
      <div
        class="emptyTile" 
        style={{
          "min-width": props.width,
          "max-width": props.width,
          "min-height": props.height,
          "max-height": props.height,
        }}
      >Blank</div>
  );
}
