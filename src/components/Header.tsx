import { createSignal,Show } from "solid-js"
import { A } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { logout } from "~/db/session";
import { AiOutlineMenu } from "solid-icons/ai";

type HeaderProps = {
  name: string;
};

export default function Header(props: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [, { Form }] = createServerAction$((_f: FormData, { request }) => {
    return logout(request);
  });

  return (
    <div class="header">
      <A href="/" class="header-logo">
        <h1>Wordspot</h1>
      </A>
      <div
        classList={{
          "menu-modal": isMenuOpen(),
        }}
        onClick={() => setIsMenuOpen(false)}
      />
      <button
        class="menu-icon"
        classList={{
          "menu-open": isMenuOpen(),
        }}
        onClick={() => setIsMenuOpen(!isMenuOpen())}
      >
        <AiOutlineMenu color="#fff" size={50} />
      </button>
      <Show when={isMenuOpen()}>
        <div class="menu-content">
          <div class="menu-row">
            <div class="menu-name">
              {`Hi ${props.name}!`}
            </div>
          </div>
          <div class="menu-row">
            <Form>
              <button name="logout" type="submit" class="logout-button">
                Log Out
              </button>
            </Form>
          </div>
        </div>
      </Show>
    </div>
  );
}
