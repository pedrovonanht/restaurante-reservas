import controller from "infra/controller";
import authentication from "models/authentication.js";
import authorization from "models/authorization.js";
import session from "models/session.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(postHandler);
router.delete(authorization.canRequest(), deleteHandler);

export default router.handler(controller.errorHandlers);

async function deleteHandler(request, response) {
  const sessionObject = request.context.session;
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
