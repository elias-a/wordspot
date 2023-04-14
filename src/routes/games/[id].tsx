import { Show, createSignal, createEffect, JSXElement } from "solid-js";
import { useRouteData, RouteDataArgs, useParams } from "solid-start";
import { createServerData$ } from "solid-start/server";
import {
  DragDropProvider,
  DragDropSensors,
  DragEventHandler,
  DragOverlay,
  Draggable,
} from "@thisbeyond/solid-dnd";
import Header from "~/components/Header";
import Board from "~/components/Board";
import User from "~/components/User";
import MovingExtraTile from "~/components/MovingExtraTile";
import NotFound from "../[...404]";
import { getGame, PlacedExtraTile } from "~/db/game";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      droppable: boolean;
      draggable: boolean;
    }
  }
}

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    async ({ id }, { request }) => await getGame(id, request),
    { key: () => { return { id: params.id } } }
  );
}

export default function Game() {
  const params = useParams();
  const game = useRouteData<typeof routeData>();
  const [clicked, setClicked] = createSignal<string[]>([], { equals: false });
  const [selected, setSelected] = createSignal<string[]>([], { equals: false });
  const [extraTile, setExtraTile] = createSignal<PlacedExtraTile>();

  createEffect(() => {
    if (game() && game()!.userData.myTokens >= 0) {
      setClicked([]);
      setExtraTile(undefined);
    }
  });

  const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
    if (draggable && droppable && game()) {
      const draggableId = draggable.id.toString();
      const droppableId = droppable.id.toString();

      if (extraTile()) {
        const letters = extraTile()!.letters.map(l => l.id);

        const updatedClicked: string[] = [];
        clicked().forEach(l => {
          if (!letters.includes(l)) {
            updatedClicked.push(l);
          }
        });

        setClicked(updatedClicked);
      }

      if (droppableId === "extra-tiles-area") {
        setExtraTile(undefined);
      } else {
        const selectedExtraTile = game()!.extraTiles
          .find(t => t.id === draggableId);
        if (selectedExtraTile) {
          setExtraTile({
            ...selectedExtraTile,
            tileId: droppableId,
          });
        } else {
          setExtraTile(undefined);
        }
      }
    }
  };
  
  return (
    <DragDropProvider onDragEnd={onDragEnd}>
      <DragDropSensors />
      <div class="app">
        <div class="authentication-screen" />
        <Show when={game()} fallback={<NotFound />}>
          <Header name={game()!.userData.myName} />
          <div class="content">
            <Board
              board={game()!.board}
              extraTile={extraTile()}
              clicked={clicked()}
              setClicked={setClicked}
              selected={selected()}
              setSelected={setSelected}
              disabled={
                game()!.userData.myTokens - clicked().length === 0 ||
                game()!.userData.winner !== null
              }
            />
            <User
              gameId={params.id}
              userData={game()!.userData}
              board={game()!.board}
              extraTiles={game()!.extraTiles}
              extraTile={extraTile()}
              clicked={clicked()}
              selected={selected()}
            />
          </div>
          <DragOverlay>
            {((draggable: Draggable) => {
              return (
                <MovingExtraTile
                  tile={game()!.extraTiles.find(tile => tile.id === draggable!.id.toString())!}
                />
              );
            }) as JSXElement}
          </DragOverlay>
        </Show>
      </div>
    </DragDropProvider>
  );
}
