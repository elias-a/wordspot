import { Setter } from "solid-js";
import type { Letter } from "~/db/game";

type LetterProps = {
  letter: Letter;
  clicked: string[];
  setClicked: Setter<string[]>;
  disabled: boolean;
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
      classList={{
        letter: true,
        letterUsed: props.letter.isUsed,
        letterClicked: props.clicked.includes(props.letter.id),
        letterSelected: props.letter.isUsed &&
          props.clicked.includes(props.letter.id),
      }}
      onClick={handleClick}
      disabled={props.disabled}
    >
      {props.letter.letter}
    </button>
  );
}
