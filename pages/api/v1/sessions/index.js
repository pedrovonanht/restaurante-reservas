import controller from "infra/controller";
import authentication from "models/authentication.js";
import session from "models/session.js";
import { createRouter } from "next-connect";
import { stringifySetCookie } from "cookie";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const { email, password } = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    email,
    password,
  );
  
  const newSession = await session.create(authenticatedUser.id);

  response.setHeader(
    "Set-Cookie",
    stringifySetCookie({
      name: "session_id",
      value: newSession.token,
      maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
      path: "/",
      httpOnly: true,
    }),
  );

  return response.status(201).json(newSession);
}
