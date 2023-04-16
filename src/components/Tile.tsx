import { Setter } from "solid-js";
import LetterRow from "~/components/LetterRow";
import type { Letter, UserData } from "~/db/game";

type TileProps = {
  letters: Letter[];
  clicked: string[];
  setClicked: Setter<string[]>;
  selected: string[];
  setSelected: Setter<string[]>;
  myTurn: boolean;
  hasTokensLeft: boolean;
};

export default function Tile(props: TileProps) {
  return (
    <div class="tile">
      <LetterRow
        letters={[props.letters[0], props.letters[1]]}
        clicked={props.clicked}
        setClicked={props.setClicked}
        selected={props.selected}
        setSelected={props.setSelected}
        myTurn={props.myTurn}
        hasTokensLeft={props.hasTokensLeft}
      />
      <LetterRow
        letters={[props.letters[2], props.letters[3]]}
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
