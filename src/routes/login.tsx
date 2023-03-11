import { Show } from "solid-js";
import { useParams, useRouteData } from "solid-start";
import { FormError } from "solid-start/data";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { createUserSession, getUser } from "~/db/session";

function validateName(name: unknown) {}
function validatePhone(phone: unknown) {}

export function routeData() {
  return createServerData$(async (_, { request }) => {
    if (await getUser(request)) {
      throw redirect("/");
    }
    return {};
  });
}

export default function Login() {
  const data = useRouteData<typeof routeData>();
  const params = useParams();

  const [loggingIn, { Form }] = createServerAction$(async (form: FormData) => {
    const name = form.get("name");
    const phone = form.get("phone");
    const redirectTo = form.get("redirectTo") || "/";
    if (
      typeof name !== "string" ||
      typeof phone !== "string" ||
      typeof redirectTo !== "string"
    ) {
      throw new FormError(`Form not submitted correctly.`);
    }

    const fields = { name, phone };
    const fieldErrors = {
      name: validateName(name),
      phone: validatePhone(phone),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
      throw new FormError("Fields invalid", { fieldErrors, fields });
    }

    return createUserSession();
  });

  return (
    <main>
      <h1>Login</h1>
      <Form>
        <input
          type="hidden"
          name="redirectTo"
          value={params.redirectTo ?? "/"}
        />
        <div>
          <label for="name-input">Name</label>
          <input name="name" placeholder="Name" />
        </div>
        <Show when={loggingIn.error?.fieldErrors?.name}>
          <p role="alert">{loggingIn.error.fieldErrors.name}</p>
        </Show>
        <div>
          <label for="phone-input">Phone Number</label>
          <input name="phone" placeholder="Phone Number" />
        </div>
        <Show when={loggingIn.error?.fieldErrors?.phone}>
          <p role="alert">{loggingIn.error.fieldErrors.phone}</p>
        </Show>
        <Show when={loggingIn.error}>
          <p role="alert" id="error-message">
            {loggingIn.error.message}
          </p>
        </Show>
        <button type="submit">{data() ? "Login" : ""}</button>
      </Form>
    </main>
  );
}
