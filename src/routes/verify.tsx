import { Show } from "solid-js";
import { useParams } from "solid-start";
import { FormError } from "solid-start/data";
import { createServerAction$ } from "solid-start/server";
import { login } from '~/db/session';

export default function Login() {
  const params = useParams();

  const [loggingIn, { Form }] = createServerAction$(async (form: FormData, { request }) => {
    const code = form.get("code");
    const redirectTo = form.get("redirectTo") || "/";
    if (
      typeof code !== "string" ||
      typeof redirectTo !== "string"
    ) {
      throw new FormError(`Form not submitted correctly.`);
    }

    const fields = { code };
    const fieldErrors = {
      code: false,
    };
    if (Object.values(fieldErrors).some(Boolean)) {
      throw new FormError("Fields invalid", { fieldErrors, fields });
    }

    return login(request, code);
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
          <label for="code-input">Verification Code</label>
          <input name="code" placeholder="Verification Code" />
        </div>
        <Show when={loggingIn.error?.fieldErrors?.code}>
          <p role="alert">{loggingIn.error.fieldErrors.code}</p>
        </Show>
        <Show when={loggingIn.error}>
          <p role="alert" id="error-message">
            {loggingIn.error.message}
          </p>
        </Show>
        <button type="submit">{"Log In"}</button>
      </Form>
    </main>
  );
}
