import controller from "infra/controller";
import user from "models/user.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const foundUserObject = await user.findOneByUsername(username)
  return response.status(200).json(foundUserObject);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const values = request.body;
  const updatedUserObject = await user.update(username, values)
  return response.status(200).json(updatedUserObject);
}

