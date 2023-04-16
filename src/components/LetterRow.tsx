import { Setter } from "solid-js";
import LetterComponent from "~/components/Letter";
import { Letter, UserData } from "~/db/game";

type LetterRowProps = {
  letters: [Letter, Letter];
  clicked: string[];
  setClicked: Setter<string[]>;
  selected: string[];
  setSelected: Setter<string[]>;
  myTurn: boolean;
  hasTokensLeft: boolean;
};

export default function LetterRow(props: LetterRowProps) {
  return (
    <div class="letter-row">
      <LetterComponent
        letter={props.letters[0]}
        clicked={props.clicked}
        setClicked={props.setClicked}
        selected={props.selected}
        setSelected={props.setSelected}
        myTurn={props.myTurn}
        hasTokensLeft={props.hasTokensLeft}
      />
      <LetterComponent
        letter={props.letters[1]}
        clicked={props.clicked}
        setClicked={props.setClicked}
        selected={props.selected}
        setSelected={props.setSelected}
        myTurn={props.myTurn}
        hasTokensLeft={props.hasTokensLeft}
      />
    </div>
  );
}
