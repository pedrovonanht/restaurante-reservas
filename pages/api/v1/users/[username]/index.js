import { ForbiddenError } from "infra/error.js";
import controller from "infra/controller";
import user from "models/user.js";
import authorization from "models/authorization.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(authorization.canRequest(), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const foundUserObject = await user.findOneByUsername(username);
  const filteredUser = authorization.filterOutput("read:user", foundUserObject);
  return response.status(200).json(filteredUser);
}

async function patchHandler(request, response) {
  const requestingUser = request.context.user;
  const username = request.query.username;
  const targetUser = await user.findOneByUsername(username);

  if (requestingUser.id !== targetUser.id) {
    throw new ForbiddenError({
      message: "Usuário não pode executar esta operação.",
      action: "Você não possui permissão para atualizar outro usuário.",
    });
  }

  const values = request.body;
  const updatedUserObject = await user.update(username, values);
  const filteredUser = authorization.filterOutput(
    "read:user",
    updatedUserObject,
  );
  return response.status(200).json(filteredUser);
}
