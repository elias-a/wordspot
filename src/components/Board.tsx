import { For, Switch, Match, createResource } from "solid-js";
import Tile from "~/components/Tile";
import PlaceholderTile from "~/components/PlaceholderTile";
import EmptyTile from "~/components/EmptyTile";
import { BOARD_WIDTH, BOARD_HEIGHT } from "~/db/game";
import type { TileLocation, TileDimensions } from "~/db/game";

type BoardProps = {
  layout: {
    layout: TileLocation[],
    dimensions: TileDimensions,
  };
};

export default function Board(props: BoardProps) {
  return (
    <div
      class="board"
      style={{
        "min-width": `${BOARD_WIDTH}px`,
        "max-width": `${BOARD_WIDTH}px`,
        "min-height": `${BOARD_HEIGHT}px`,
        "max-height": `${BOARD_HEIGHT}px`,
      }}
    >
      <For each={props.layout.layout}>
        {tile => {
          return (
            <Switch>
              <Match when={tile.key === 2}>
                <Tile dimensions={props.layout.dimensions} />
              </Match>
              <Match when={tile.key === 1}>
                <EmptyTile dimensions={props.layout.dimensions} />
              </Match>
              <Match when={tile.key === 0}>
                <PlaceholderTile dimensions={props.layout.dimensions} />
              </Match>
            </Switch>
          );
        }}
      </For>
    </div>
  );
}
