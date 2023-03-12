import { For, Switch, Match } from "solid-js";
import Tile from "~/components/Tile";
import PlaceholderTile from "~/components/PlaceholderTile";
import EmptyTile from "~/components/EmptyTile";
import type { TileLocation } from "~/db/game";

type BoardProps = {
  layout: TileLocation[];
};

export default function Board(props: BoardProps) {
  const width = "100px";
  const height = "100px";

  return (
    <div class="board">
      <For each={props.layout}>
        {tile => {
          return (
            <Switch>
              <Match when={tile.key === 2}>
                <Tile width={width} height={height} />
              </Match>
              <Match when={tile.key === 1}>
                <EmptyTile width={width} height={height} />
              </Match>
              <Match when={tile.key === 0}>
                <PlaceholderTile width={width} height={height} />
              </Match>
            </Switch>
          );
        }}
      </For>
    </div>
  );
}
