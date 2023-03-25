import { For, Switch, Match } from "solid-js";
import { A } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { UserAccount } from "~/db/session";
import { startGame } from "~/db/game";

type DashboardProps = {
  user: UserAccount;
  games: any;
};

export default function Dashboard(props: DashboardProps) {
  const [, { Form }] = createServerAction$(async (_form: FormData, { request }) => {
    return await startGame(request);
  });

  return (
    <div class="dashboard">
      <div class="dashboard-user-section">
        <h1 class="dashboard-section-title">Welcome, {props.user.userName}!</h1>
        <Form>
          <button name="start-game" type="submit" class="start-game-button">
            Start New Game
          </button>
        </Form>
      </div>
      <div class="dashboard-game-section">
        <h1 class="dashboard-section-title">Your Games</h1>
        <For each={props.games}>{game => {
          return (
            <div class="game-card">
              <div class="game-summary">
                <p class="game-summary-item">
                  <Switch>
                    <Match when={game.winner === props.user.id}>
                      {`You won!`}
                    </Match>
                    <Match when={game.winner}>
                      {`You lost!`}
                    </Match>
                    <Match when={game.myTurn}>
                      {`Your turn!`}
                    </Match>
                    <Match when={game.opponentTurn}>
                      {`${game.opponentName}'s Turn!`}
                    </Match>
                  </Switch>
                </p>
                <p class="game-summary-item">
                  <Switch>
                    <Match when={game.firstPlayer === props.user.id}>
                      {`${game.myName} vs ${game.opponentName}`}
                    </Match>
                    <Match when={game.firstPlayer !== props.user.id}>
                      {`${game.myName} vs ${game.opponentName}`}
                    </Match>
                  </Switch>
                </p>
                <p class="game-summary-item">{`Game started: ${game.dateCreated}`}</p>
              </div>
              <A href={`/games/${game.id}`} class="play-game-button">
                Play Game
              </A>
            </div>
          );
        }}
        </For>
      </div>
    </div>
  );
}
