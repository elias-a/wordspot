import { Show, createSignal } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import Board from "~/components/Board";
import { getBoardLayout } from "~/db/game";

export function routeData() {
  return createServerData$(async () => {
    return await getBoardLayout();
  });
}

export default function Game() {
  const boardLayout = useRouteData<typeof routeData>();
  const [clicked, setClicked] = createSignal<number[]>([], { equals: false });

  return (
    <Show when={boardLayout()} fallback={<div>Loading...</div>} keyed>
      {boardLayout => {
        return (
          <Board
            layout={boardLayout}
            clicked={clicked()}
            setClicked={setClicked}
          />
        );
      }}
    </Show>
  );
}
