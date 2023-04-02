import { Show, createSignal } from "solid-js";
import { useRouteData, RouteDataArgs, useParams } from "solid-start";
import { createServerData$ } from "solid-start/server";
import {
  DragDropProvider,
  DragDropSensors,
  DragEventHandler,
} from "@thisbeyond/solid-dnd";
import Header from "~/components/Header";
import Board from "~/components/Board";
import User from "~/components/User";
import NotFound from "../[...404]";
import { getGame, ExtraTile } from "~/db/game";

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
  const [extraTile, setExtraTile] = createSignal<ExtraTile>();

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
        const selectedExtraTile = game()!.board
          .extraTiles.find(t => t.id === draggableId);
        if (selectedExtraTile) {
          setExtraTile({
            ...selectedExtraTile,
            row: 0,
            column: 0,
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
        <Header />
        <div class="content">
          <Show when={game()} fallback={<NotFound />}>
              <Board
                board={game()!.board.board}
                extraTile={extraTile()}
                clicked={clicked()}
                setClicked={setClicked}
              />
              <User
                gameId={params.id}
                userData={game()!.userData}
                board={game()!.board.board}
                extraTiles={game()!.board.extraTiles}
                extraTile={extraTile()}
                clicked={clicked()}
                setClicked={setClicked}
              />
          </Show>
        </div>
      </div>
    </DragDropProvider>
  );
}
