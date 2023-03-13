import { For, Show, Switch, Match, Setter } from "solid-js";
import Tile from "~/components/Tile";
import PlaceholderTile from "~/components/PlaceholderTile";
import EmptyTile from "~/components/EmptyTile";
import ExtraTile from "~/components/ExtraTile";
import { BOARD_WIDTH, BOARD_HEIGHT } from "~/db/game";
import type { TileLocation, TileDimensions, UserData } from "~/db/game";

type BoardProps = {
  layout: {
    layout: TileLocation[],
    dimensions: TileDimensions,
    userData: UserData,
  };
  clicked: number[];
  setClicked: Setter<number[]>;
  extraTile: [number, number];
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
                <Tile
                  tile={tile.tile}
                  dimensions={props.layout.dimensions}
                  clicked={props.clicked}
                  setClicked={props.setClicked}
                />
              </Match>
              <Match when={tile.key === 1}>
                <Show
                  when={props.extraTile && props.extraTile[0] === tile.id}
                  fallback={<EmptyTile id={tile.id} dimensions={props.layout.dimensions} />}
                >
                  <ExtraTile
                    tile={props.layout.userData.extraTiles[0]}
                    dimensions={props.layout.dimensions}
                    clicked={props.clicked}
                    setClicked={props.setClicked}
                  />
                </Show>
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
