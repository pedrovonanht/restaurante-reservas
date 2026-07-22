import { ForbiddenError, NotFoundError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import membership from "models/membership";
import authorization from "models/authorization.js";
import event from "models/event.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.patch(controller.canUserRequest(), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const requestingUser = request.context.user;
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );

  const membershipObject = await membership.findOneByRestaurantIdAndUserId(
    restaurantObject.id,
    requestingUser.id,
  );

  if (!membershipObject) {
    throw new NotFoundError({
      message: "O `slug` informado não foi encontrado no sistema.",
      action: "Verifique o `slug` informado.",
    });
  }

  if (!authorization.can(membershipObject, "update:event")) {
    throw new ForbiddenError({
      message: "Usuário não pode executar esta operação.",
      action:
        'Verifique se este usuário possui a feature "update:event" para esse restaurante.',
    });
  }

  const updatedEvent = await event.update(
    restaurantObject.id,
    request.query.date,
    request.body,
  );
  const filteredEvent = authorization.filterOutput("read:event", updatedEvent);
  return response.status(200).json(filteredEvent);
}
