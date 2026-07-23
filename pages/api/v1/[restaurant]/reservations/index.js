import controller from "infra/controller";
import { createRouter } from "next-connect";
import reservation from "models/reservation"
import restaurant from "models/restaurant";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const restaurantObject = await restaurant.findOneBySlug(request.query.restaurant)
  console.log(restaurantObject)
  const reservationObject = await reservation.create(restaurantObject.id, request.body) 
  return response.status(201).json(reservationObject);
}
