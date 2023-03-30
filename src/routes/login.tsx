import { Show } from "solid-js";
import { useParams } from "solid-start";
import { FormError } from "solid-start/data";
import { createServerAction$ } from "solid-start/server";
import { createUserSession } from "~/db/session";

function validatePhone(phone: unknown) {}

export function routeData() {}

export default function Login() {
  const params = useParams();

  const [loggingIn, { Form }] = createServerAction$(async (form: FormData, { request }) => {
    const phone = form.get("phone");
    const redirectTo = form.get("redirectTo") || "/";
    if (
      typeof phone !== "string" ||
      typeof redirectTo !== "string"
    ) {
      throw new FormError(`Form not submitted correctly.`);
    }

    const fields = { phone };
    const fieldErrors = {
      phone: validatePhone(phone),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
      throw new FormError("Fields invalid", { fieldErrors, fields });
    }

    return createUserSession(phone, request);
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
        <button type="submit">{"Login"}</button>
      </Form>
    </main>
  );
}
