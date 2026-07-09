import controller from "infra/controller";
import session from "models/session";
import { createRouter } from "next-connect";
import user from "models/user"

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionObject = await session.findOneValidByToken(request.cookies.session_id);
  const foundUser = await user.findOneById(sessionObject.user_id);
  await session.renew(sessionObject.id)

  controller.setCookiesHeader(response, sessionObject.token)
  return response.status(200).json(foundUser);
}
