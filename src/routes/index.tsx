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

    const games = await getGames(request);

    return user;
  });
}

export default function Home() {
  const user = useRouteData<typeof routeData>();

  return (
    <div class="app">
      <Header />
      <Show when={user()}>
        <Dashboard user={user()!} />
      </Show>
    </div>
  );
}
