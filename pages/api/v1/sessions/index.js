import controller from "infra/controller";
import authentication from "models/authentication.js";
import session from "models/session.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.post(postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function deleteHandler(request, response) {
  const sessionObject = await session.findOneValidByToken(
    request.cookies.session_id,
  );
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearCookiesHeader(response);
  return response.status(200).json(expiredSession);
}

async function postHandler(request, response) {
  const { email, password } = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    email,
    password,
  );

  const newSession = await session.create(authenticatedUser.id);

  controller.setCookiesHeader(response, newSession.token);

  return response.status(201).json(newSession);
}
