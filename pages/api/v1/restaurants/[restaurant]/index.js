import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import { createRouter } from "next-connect";
import session from "models/session";

const router = createRouter();
router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  await session.findOneValidByToken(request.cookies.session_id);
  const restaurantSlug = request.query.restaurant
  const values = request.body
  const updatedRestaurant = await restaurant.update(restaurantSlug, values)
  return response.status(200).json(updatedRestaurant)
}

async function getHandler(request, response) {
  const restaurantObject = await restaurant.findOneBySlug(request.query.restaurant)  
  return response.status(200).json(restaurantObject);
}
