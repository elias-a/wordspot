import { Setter } from "solid-js";
import type { TileDimensions, Letter } from "~/db/game";

type LetterProps = {
  letter: Letter;
  dimensions: TileDimensions;
  clicked: number[];
  setClicked: Setter<number[]>;
};

export default function Letter(props: LetterProps) {
  const handleClick = (_event: MouseEvent) => {
    if (props.clicked.includes(props.letter.id)) {
      props.setClicked(clicked => clicked.filter(c => c !== props.letter.id));
    } else {
      props.setClicked(clicked => [...clicked, props.letter.id]);
    }
  }

  return (
    <button
      class="letter"
      style={{
        "min-width": `${props.dimensions.width / 2}px`,
        "max-width": `${props.dimensions.width / 2}px`,
        "min-height": `${props.dimensions.height / 2}px`,
        "max-height": `${props.dimensions.height / 2}px`,
        "background-color": props.clicked.includes(props.letter.id) ? "red" : "yellow",
      }}
      onClick={handleClick}
    >
      {props.letter.letter}
    </button>
  );
}
