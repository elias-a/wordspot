import { Setter } from "solid-js";
import LetterComponent from "~/components/Letter";
import { Letter } from "~/db/game";

type LetterRowProps = {
  letters: [Letter, Letter];
  clicked: string[];
  setClicked: Setter<string[]>;
  disabled: boolean;
};

export default function LetterRow(props: LetterRowProps) {
  return (
    <div class="letter-row">
      <LetterComponent
        letter={props.letters[0]}
        clicked={props.clicked}
        setClicked={props.setClicked}
        disabled={props.disabled}
      />
      <LetterComponent
        letter={props.letters[1]}
        clicked={props.clicked}
        setClicked={props.setClicked}
        disabled={props.disabled}
      />
    </div>
  );
}
