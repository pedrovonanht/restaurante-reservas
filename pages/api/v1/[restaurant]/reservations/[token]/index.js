import controller from "infra/controller";
import { createRouter } from "next-connect";
import reservation from "models/reservation";
import restaurant from "models/restaurant";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );
  const reservationObject = await reservation.findOneByRestaurantIdAndToken(
    restaurantObject.id,
    request.query.token,
  );
  return response.status(200).json(reservationObject);
}
