import { Show } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { getUser } from "~/db/session";
import { getGames } from "~/db/game";
import Header from "~/components/Header";
import Dashboard from "~/components/Dashboard";

export function routeData() {
  return createServerData$(async (_, { request }) => {
    const user = await getUser(request);

    if (!user) {
      throw redirect("/login");
    }

    const games = await getGames(user.id);

    return { user, games };
  });
}

export default function Home() {
  const data = useRouteData<typeof routeData>();

  return (
    <div class="app">
      <Header />
      <Show when={data()}>
        <Dashboard user={data()!.user} games={data()!.games} />
      </Show>
    </div>
  );
}
