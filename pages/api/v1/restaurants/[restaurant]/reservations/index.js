import { NotFoundError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import reservation from "models/reservation.js";
import authorization from "models/authorization.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.use(controller.injectNullOrMembership);
router.get(controller.canUserRequest(), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );

  const membershipObject = request.context.membership;

  if (
    !membershipObject ||
    !authorization.can(membershipObject, "read:restaurant")
  ) {
    throw new NotFoundError({
      message: "O `slug` informado não foi encontrado no sistema.",
      action: "Verifique o `slug` informado.",
    });
  }

  const { from, to } = request.query;
  const reservations = await reservation.findAllByRestaurantId(
    restaurantObject.id,
    { from, to },
  );

  return response.status(200).json(reservations);
}
