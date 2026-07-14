import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const restaurantObject = await restaurant.findOneBySlug(request.query.restaurant)  
  return response.status(200).json(restaurantObject);
}
