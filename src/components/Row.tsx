import { For, Show, Switch, Match, Setter } from "solid-js";
import TileComponent from "~/components/Tile";
import PlaceholderTile from "~/components/PlaceholderTile";
import EmptyTile from "~/components/EmptyTile";
import PlacedExtraTileComponent from "~/components/PlacedExtraTile";
import { Row, PlacedExtraTile, UserData } from "~/db/game";

type RowProps = {
  row: Row;
  extraTile: PlacedExtraTile | undefined;
  clicked: string[]
  setClicked: Setter<string[]>;
  selected: string[];
  setSelected: Setter<string[]>;
  myTurn: boolean;
  hasTokensLeft: boolean;
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
                  selected={props.selected}
                  setSelected={props.setSelected}
                  myTurn={props.myTurn}
                  hasTokensLeft={props.hasTokensLeft}
                />
              </Match>
              <Match when={tile.type === "Empty"}>
                <Show
                  when={props.extraTile && props.extraTile.tileId === tile.id}
                  fallback={<EmptyTile id={tile.id} />}
                >
                  <PlacedExtraTileComponent
                    tile={props.extraTile!}
                    clicked={props.clicked}
                    setClicked={props.setClicked}
                    selected={props.selected}
                    setSelected={props.setSelected}
                    hasTokensLeft={props.hasTokensLeft}
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
