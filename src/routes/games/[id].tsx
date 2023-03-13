import { Show, createSignal } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import {
  DragDropProvider,
  DragDropSensors,
  DragEventHandler,
} from "@thisbeyond/solid-dnd";
import Board from "~/components/Board";
import UserArea from "~/components/UserArea";
import { getBoardLayout } from "~/db/game";

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
    return await getBoardLayout();
  });
}

export default function Game() {
  const boardLayout = useRouteData<typeof routeData>();
  const [clicked, setClicked] = createSignal<number[]>([], { equals: false });
  const [extraTile, setExtraTile] = createSignal<[number, number]>([-1, -1]);

  const onDragEnd: DragEventHandler = ({ droppable }) => {
    if (droppable) {
      const id = parseInt(droppable.id.toString())
      if (id === 100000) {
        setExtraTile([-1, -1]);
      } else {
        setExtraTile([id, 0]);
      }
    }
  };
  
  return (
    <DragDropProvider onDragEnd={onDragEnd}>
      <DragDropSensors />
      <Show when={boardLayout()} fallback={<div>Loading...</div>} keyed>
        {boardLayout => {
          return (
            <>
              <Board
                layout={boardLayout}
                clicked={clicked()}
                setClicked={setClicked}
                extraTile={extraTile()}
              />
              <UserArea
                dimensions={boardLayout.dimensions}
                extraTiles={boardLayout.userData.extraTiles}
                extraTile={extraTile()}
                clicked={clicked()}
                setClicked={setClicked}
              />
            </>
          );
        }}
      </Show>
    </DragDropProvider>
  );
}
