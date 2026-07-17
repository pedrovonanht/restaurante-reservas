import controller from "infra/controller";
import session from "models/session";
import authorization from "models/authorization.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(controller.canUserRequest(), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const requestingUser = request.context.user;
  const sessionObject = request.context.session;
  await session.renew(sessionObject.id);

  controller.setCookiesHeader(response, sessionObject.token);
  const filteredUser = authorization.filterOutput("read:user", requestingUser);
  return response.status(200).json(filteredUser);
}
