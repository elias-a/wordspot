import { Show } from "solid-js";
import { useParams } from "solid-start";
import { FormError } from "solid-start/data";
import { createServerAction$ } from "solid-start/server";
import { createUserSession } from "~/db/session";
import Spinner from "~/components/Spinner";

function isInvalidPhone(phone: string) {
  const regex = /^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}[\s]*$/;
  return !regex.test(phone);
}

export function routeData() {}

export default function PhoneNumber() {
  const params = useParams();

  const [loggingIn, { Form }] = createServerAction$(async (form: FormData) => {
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
      phone: isInvalidPhone(phone),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
      throw new FormError("Invalid phone number", { fieldErrors, fields });
    }

    return createUserSession(phone);
  });

  return (
    <div class="app">
      <div class="authentication-screen" />
      <div
        class="authentication-content"
        classList={{
          authErrorContent: loggingIn.error,
        }}
      >
        <div class="authentication-field authentication-title">
          <h1>Login to Wordspot</h1>
        </div>
        <Form>
          <input
            type="hidden"
            name="redirectTo"
            value={params.redirectTo ?? "/"}
          />
          <div class="authentication-field">
            <input name="phone" placeholder="Phone Number" autocomplete="off" />
          </div>
          <Show when={loggingIn.error}>
            <div class="authentication-field authentication-error">
              {loggingIn.error.message}
            </div>
          </Show>
          <button
            type="submit"
            disabled={loggingIn.pending}
            class="authentication-button"
          >
            <Show
              when={!loggingIn.pending}
              fallback={<Spinner />}
            >Continue</Show>
          </button>
        </Form>
      </div>
    </div>
  );
}
