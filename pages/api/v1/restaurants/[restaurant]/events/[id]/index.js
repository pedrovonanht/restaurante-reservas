import { ForbiddenError, NotFoundError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import authorization from "models/authorization.js";
import event from "models/event.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.use(controller.injectNullOrMembership);
router.get(getHandler);
router.patch(controller.canUserRequest(), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );

  const membershipObject = request.context.membership;

  const eventObject = await event.findOneByRestaurantIdAndId(
    restaurantObject.id,
    request.query.id,
  );

  if (!eventObject) {
    throw new NotFoundError({
      message: "O evento informado não foi encontrado no sistema.",
      action: "Verifique o `id` informado.",
    });
  }

  if (authorization.can(membershipObject, "read:event")) {
    const filteredEvent = authorization.filterOutput("read:event", eventObject);
    return response.status(200).json(filteredEvent);
  }

  if (!eventObject.active) {
    throw new NotFoundError({
      message: "O evento informado não foi encontrado no sistema.",
      action: "Verifique o `id` informado.",
    });
  }

  const publicEvent = authorization.filterOutput("read:event:public", eventObject);
  return response.status(200).json(publicEvent);
}

async function patchHandler(request, response) {
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );

  const membershipObject = request.context.membership;

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
    request.query.id,
    request.body,
  );
  const filteredEvent = authorization.filterOutput("read:event", updatedEvent);
  return response.status(200).json(filteredEvent);
}
