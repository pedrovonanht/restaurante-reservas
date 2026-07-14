import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import session from "models/session.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const sessionObject = await session.findOneValidByToken(
    request.cookies.session_id,
  );
  const newRestaurant = await restaurant.create(
    sessionObject.user_id,
    request.body,
  );
  return response.status(201).json(newRestaurant);
}
