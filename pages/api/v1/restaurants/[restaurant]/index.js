import { ForbiddenError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import authorization from "models/authorization.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest(), getHandler);
router.patch(controller.canRequest(), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const requestingUser = request.context.user;
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );
  const membershipObject = await authorization.requireMembership(
    requestingUser,
    restaurantObject.id,
  );

  if (!authorization.can(membershipObject, "read:restaurant")) {
    throw new ForbiddenError({
      message: "Usuário não pode executar esta operação.",
      action: 'Verifique se este usuário possui a feature "read:restaurant".',
    });
  }

  const filteredRestaurant = authorization.filterOutput(
    "read:restaurant",
    restaurantObject,
  );
  return response.status(200).json(filteredRestaurant);
}

async function patchHandler(request, response) {
  const requestingUser = request.context.user;
  const restaurantSlug = request.query.restaurant;
  const restaurantObject = await restaurant.findOneBySlug(restaurantSlug);
  const membershipObject = await authorization.requireMembership(
    requestingUser,
    restaurantObject.id,
  );

  if (!authorization.can(membershipObject, "update:restaurant")) {
    throw new ForbiddenError({
      message: "Usuário não pode executar esta operação.",
      action: 'Verifique se este usuário possui a feature "update:restaurant".',
    });
  }

  const values = request.body;
  const updatedRestaurant = await restaurant.update(restaurantSlug, values);
  const filteredRestaurant = authorization.filterOutput(
    "read:restaurant",
    updatedRestaurant,
  );
  return response.status(200).json(filteredRestaurant);
}
