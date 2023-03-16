import { Show, createSignal } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import {
  DragDropProvider,
  DragDropSensors,
  DragEventHandler,
} from "@thisbeyond/solid-dnd";
import Board from "~/components/Board";
import User from "~/components/User";
import NotFound from "../[...404]";
import { getGame, Tile, ExtraTile } from "~/db/game";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      droppable: boolean;
      draggable: boolean;
    }
  }
}

export function routeData() {
  return createServerData$(async () => {
    return await getGame();
  });
}

export default function Game() {
  const game = useRouteData<typeof routeData>();
  const [clicked, setClicked] = createSignal<string[]>([], { equals: false });
  const [extraTile, setExtraTile] = createSignal<ExtraTile>();

  const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
    if (draggable && droppable && game()) {
      const draggableId = draggable.id.toString();
      const droppableId = droppable.id.toString();

      if (droppableId === "extra-tiles-area") {
        setExtraTile(undefined);
      } else {
        const selectedExtraTile = game()!
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
      <Show when={game()} fallback={<NotFound />}>
        <div class="game">
          <Board
            board={game()!.board}
            extraTile={extraTile()}
            clicked={clicked()}
            setClicked={setClicked}
          />
          <User
            extraTiles={game()!.extraTiles}
            extraTile={extraTile()}
            clicked={clicked()}
            setClicked={setClicked}
          />
        </div>
      </Show>
    </DragDropProvider>
  );
}
