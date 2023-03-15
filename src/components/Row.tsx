import { For, Show, Switch, Match, Setter } from "solid-js";
import TileComponent from "~/components/Tile";
import PlaceholderTile from "~/components/PlaceholderTile";
import EmptyTile from "~/components/EmptyTile";
import ExtraTile from "~/components/ExtraTile";
import { Row, Tile } from "~/db/game";

type RowProps = {
  row: Row;
  extraTile: Tile | undefined;
  clicked: string[]
  setClicked: Setter<string[]>;
};

export default function RowComponent(props: RowProps) {
  return (
    <div class="row">
      <For each={props.row.tiles}>
        {tile => {
          return (
            <Switch>
              <Match when={tile.type === "Tile"}>
                <TileComponent
                  letters={tile.letters}
                  clicked={props.clicked}
                  setClicked={props.setClicked}
                />
              </Match>
              <Match when={tile.type === "Empty"}>
                <Show
                  when={props.extraTile && props.extraTile.id === tile.id}
                  fallback={<EmptyTile id={tile.id} />}
                >
                  <ExtraTile
                    tile={props.extraTile!}
                    clicked={props.clicked}
                    setClicked={props.setClicked}
                  />
                </Show>
              </Match>
              <Match when={tile.type === "Placeholder"}>
                <PlaceholderTile />
              </Match>
            </Switch>
          );
        }}
      </For>
    </div>
  );
}
