import {
  StartServer,
  createHandler,
  renderAsync,
} from "solid-start/entry-server";
import { redirect } from "solid-start/server";
import { getUserId, getUnverifiedUser } from "~/db/session";

export default createHandler(
  ({ forward }) => {
    return async event => {
      const path = new URL(event.request.url).pathname;

      if (event.request.method === "GET") {
        if (!(await getUserId(event.request))) {
          const unverifiedUser = await getUnverifiedUser(event.request);
          
          if (unverifiedUser && path !== "/verify") {
            return redirect("/verify");
          } else if (!unverifiedUser && path !== "/login") {
            return redirect("/login");
          }
        } else if (["/login", "/verify"].includes(path)) {
          return redirect("/");
        }
      }

      return forward(event);
    };
  },
  renderAsync(event => <StartServer event={event} />),
);
