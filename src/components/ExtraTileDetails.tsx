import type { ExtraTile } from "~/db/game";

type ExtraTileDetailsProps = {
  tile: ExtraTile;
  disabled: boolean;
};

export default function ExtraTileDetails(props: ExtraTileDetailsProps) {
  return (
    <div class="extra-tile">
      <div class="letter-row">
        <button class="letter" disabled={true}>
          {props.tile.letters[0].letter}
        </button>
        <button class="letter" disabled={true}>
          {props.tile.letters[1].letter}
        </button>
      </div>
      <div class="letter-row">
        <button class="letter" disabled={true}>
          {props.tile.letters[2].letter}
        </button>
        <button class="letter" disabled={true}>
          {props.tile.letters[3].letter}
        </button>
      </div>
    </div>
  );
}
