import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import authorization from "models/authorization.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:restaurant"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const requestingUser = request.context.user;
  const newRestaurant = await restaurant.create(
    requestingUser.id,
    request.body,
  );
  const filteredRestaurant = authorization.filterOutput(
    "read:restaurant",
    newRestaurant,
  );
  return response.status(201).json(filteredRestaurant);
}
