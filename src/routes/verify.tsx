import { Show } from "solid-js";
import { useParams } from "solid-start";
import { FormError } from "solid-start/data";
import { createServerAction$ } from "solid-start/server";
import { login, cancelVerification } from '~/db/session';
import Spinner from "~/components/Spinner";

function isInvalidCode(code: string) {
  const regex = /^[0-9]{6}$/;
  return !regex.test(code);
}

export function routeData() {}

export default function VerificationCode() {
  const params = useParams();
  const [loggingIn, LogInForm] = createServerAction$(async (form: FormData, { request }) => {
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
      code: isInvalidCode(code),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
      throw new FormError("Invalid verification code", { fieldErrors, fields });
    }

    return login(request, code);
  });
  const [_, CancelForm] = createServerAction$(async (_formData: FormData, { request }) => {
    return cancelVerification(request);
  });

  return (
    <div class="app">
      <div class="authentication-screen" />
      <div class="authentication-content">
        <div class="authentication-field authentication-title">
          <h1>Login to Wordspot</h1>
        </div>
        <LogInForm.Form>
          <input
            type="hidden"
            name="redirectTo"
            value={params.redirectTo ?? "/"}
          />
          <div class="authentication-field">
            <input name="code" placeholder="Verification Code" autocomplete="off" />
          </div>
          <Show when={loggingIn.error}>
            <div class="error-message">
              {loggingIn.error.message}
            </div>
          </Show>
          <div class="authentication-field buttons-section">
            <button
              type="submit"
              disabled={loggingIn.pending}
              class="submit-button authentication-button"
            >
              <Show
                when={!loggingIn.pending}
                fallback={<Spinner />}
              >Continue</Show>
            </button>
          </div>
        </LogInForm.Form>
        <CancelForm.Form>
          <div class="authentication-field buttons-section">
            <button type="submit" class="authentication-cancel-button">
              Use a different phone number
            </button>
          </div>
        </CancelForm.Form>
      </div>
    </div>
  );
}
