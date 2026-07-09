import controller from "infra/controller";
import authentication from "models/authentication.js";
import session from "models/session.js";
import { createRouter } from "next-connect";

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

  controller.setCookiesHeader(response, newSession.token)

  return response.status(201).json(newSession);
}
