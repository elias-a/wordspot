import type { TileDimensions } from "~/db/game";

type LetterProps = {
  dimensions: TileDimensions;
};

export default function Letter(props: LetterProps) {
  return (
    <button
      class="letter"
      style={{
        "min-width": `${props.dimensions.width / 2}px`,
        "max-width": `${props.dimensions.width / 2}px`,
        "min-height": `${props.dimensions.height / 2}px`,
        "max-height": `${props.dimensions.height / 2}px`,
      }}
    >
      A
    </button>
  );
}
