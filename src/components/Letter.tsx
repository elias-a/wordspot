import { Setter } from "solid-js";
import type { Letter } from "~/db/game";

type LetterProps = {
  letter: Letter;
  clicked: string[];
  setClicked: Setter<string[]>;
  selected: string[];
  setSelected: Setter<string[]>;
  disabled: boolean;
};

export default function Letter(props: LetterProps) {
  const handleClick = (_event: MouseEvent) => {
    if (props.clicked.includes(props.letter.id)) {
      props.setClicked(clicked => clicked.filter(c => c !== props.letter.id));
    } else if (!props.clicked.includes(props.letter.id) && !props.letter.isUsed) {
      props.setClicked(clicked => [...clicked, props.letter.id]);
    } else if (props.selected.includes(props.letter.id)) {
      props.setSelected(selected => selected.filter(s => s !== props.letter.id));
    } else if (!props.selected.includes(props.letter.id) && props.letter.isUsed) {
      props.setSelected(selected => [...selected, props.letter.id]);
    }
  }

  return (
    <button
      class="letter"
      classList={{
        "letter-clicked": props.clicked.includes(props.letter.id),
        "letter-used": props.letter.isUsed &&
          !props.selected.includes(props.letter.id),
        "letter-selected": props.selected.includes(props.letter.id),
      }}
      onClick={handleClick}
      disabled={props.disabled &&
        !props.clicked.includes(props.letter.id) &&
        !props.letter.isUsed}
    >
      {props.letter.letter}
    </button>
  );
}
