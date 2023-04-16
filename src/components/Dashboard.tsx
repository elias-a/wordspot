import { For, Switch, Match } from "solid-js";
import { A } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { FaSolidPlay } from "solid-icons/fa";
import { UserAccount } from "~/db/session";
import { startGame } from "~/db/game";
import type { GameData } from "~/db/game";

type DashboardProps = {
  user: UserAccount;
  games: GameData[];
};

export default function Dashboard(props: DashboardProps) {
  const [, { Form }] = createServerAction$(async (_form: FormData, { request }) => {
    return await startGame(request);
  });

  return (
    <div class="dashboard">
      <div class="game-card start-game-card">
        <Form>
          <button name="start-game" type="submit" class="start-game-button">
            Start New Game
          </button>
        </Form>
      </div>
      <div class="user-games">
        <For each={props.games}>{game => {
          return (
            <div class="game-card">
              <div class="game-summary">
                <p class="game-summary-turn">
                  <Switch fallback={`${game.opponentName}'s turn!`}>
                    <Match when={game.winner === game.myId}>
                      {`You won!`}
                    </Match>
                    <Match when={game.winner}>
                      {`You lost!`}
                    </Match>
                    <Match when={game.myTurn}>
                      {`Your turn!`}
                    </Match>
                  </Switch>
                </p>
                <p class="game-summary-item">
                  <Switch fallback={`${game.opponentName} vs ${game.myName}`}>
                    <Match when={game.firstPlayer === game.myId}>
                      {`${game.myName} vs ${game.opponentName}`}
                    </Match>
                  </Switch>
                </p>
                <p class="game-summary-item">{`Game started on ${game.dateCreated}`}</p>
              </div>
                <A href={`/games/${game.id}`} class="play-game-button">
                  <FaSolidPlay color="#2b2218" size={50} />
                </A>
            </div>
          );
        }}
        </For>
      </div>
    </div>
  );
}
