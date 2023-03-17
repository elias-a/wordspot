import { A } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { logout } from "~/db/session";

export default function Header() {
  const [, { Form }] = createServerAction$((f: FormData, { request }) =>
    logout(request)
  );

  return (
    <div class="header">
      <A href="/">
        <img
          src="/images/wordspot-logo.png"
          alt="Wordspot logo"
          class="header-logo"
        />
      </A>
      <Form>
        <button name="logout" type="submit" class="logout-button">
          Logout
        </button>
      </Form>
    </div>
  );
}
