import { Show } from "solid-js";
import { useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import Board from "~/components/Board";
import { getBoardLayout } from "~/db/game";

export function routeData() {
  return createServerData$(async () => {
    return await getBoardLayout(); 
  });
}

export default function Game() {
  // const params = useParams();
  // params.id
  const boardLayout = useRouteData<typeof routeData>();

  return (
    <Show when={boardLayout()} fallback={<div>Loading...</div>}>
      <Board layout={boardLayout() || []} />
    </Show>
  );
}
