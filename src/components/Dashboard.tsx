import { A } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { UserAccount } from "~/db/session";
import { startGame } from "~/db/game";

type DashboardProps = {
  user: UserAccount;
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
      </div>
    </div>
  );
}
