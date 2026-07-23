import { ForbiddenError, NotFoundError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import authorization from "models/authorization.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.use(controller.injectNullOrMembership);
router.get(controller.canUserRequest(), getHandler);
router.patch(controller.canUserRequest(), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );

  const membershipObject = request.context.membership

  if (
    !membershipObject ||
    !authorization.can(membershipObject, "read:restaurant")
  ) {
    throw new NotFoundError({
      message: "O `slug` informado não foi encontrado no sistema.",
      action: "Verifique o `slug` informado.",
    });
  }
  const filteredRestaurant = authorization.filterOutput(
    "read:restaurant",
    restaurantObject,
  );
  return response.status(200).json(filteredRestaurant);
}

async function patchHandler(request, response) {
  const restaurantSlug = request.query.restaurant;

  const membershipObject = request.context.membership

  if (
    !membershipObject ||
    !authorization.can(membershipObject, "update:restaurant")
  ) {
    throw new ForbiddenError({
      message: "Usuário não pode executar esta operação.",
      action:
        'Verifique se este usuário possui a feature "update:restaurant" para esse restaurante.',
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
