import { ForbiddenError, NotFoundError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import membership from "models/membership";
import authorization from "models/authorization.js";
import event from "models/event.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.post(controller.canUserRequest(), postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const requestingUser = request.context.user;
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );

  const membershipObject = requestingUser
    ? await membership.findOneByRestaurantIdAndUserId(
        restaurantObject.id,
        requestingUser.id,
      )
    : null;

  const events = await event.findAllByRestaurantId(restaurantObject.id);

  if (membershipObject) {
    const filteredEvents = events.map((eventObject) =>
      authorization.filterOutput("read:event", eventObject),
    );
    return response.status(200).json(filteredEvents);
  }

  const publicEvents = events
    .filter((eventObject) => eventObject.active)
    .map((eventObject) =>
      authorization.filterOutput("read:event:public", eventObject),
    );

  return response.status(200).json(publicEvents);
}

async function postHandler(request, response) {
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

  if (!authorization.can(membershipObject, "create:event")) {
    throw new ForbiddenError({
      message: "Usuário não pode executar esta operação.",
      action:
        'Verifique se este usuário possui a feature "create:event" para esse restaurante.',
    });
  }

  const newEvent = await event.create(restaurantObject.id, request.body);
  const filteredEvent = authorization.filterOutput("read:event", newEvent);
  return response.status(201).json(filteredEvent);
}
