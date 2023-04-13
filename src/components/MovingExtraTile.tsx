import ExtraTileDetails from "~/components/ExtraTileDetails";
import type { ExtraTile } from "~/db/game";

type MovingExtraTileProps = {
  tile: ExtraTile;
};

export default function MovingExtraTile(props: MovingExtraTileProps) {

  return (
    <div class="tile">
      <ExtraTileDetails
        tile={props.tile}
        disabled={true}
      />
    </div>
  );
}
