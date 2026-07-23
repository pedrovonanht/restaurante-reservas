import { ForbiddenError, NotFoundError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import authorization from "models/authorization.js";
import event from "models/event.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.use(controller.injectNullOrMembership)
router.get(getHandler);
router.post(controller.canUserRequest(), postHandler);

export default router.handler(controller.errorHandlers);


async function getHandler(request, response) {
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );
  const membershipObject = request.context.membership
        

  const events = await event.findAllByRestaurantId(restaurantObject.id);
  
  if (authorization.can(membershipObject, "read:event")) {
    const filteredEvents = authorization.filterOutput("read:event", events)
    
    return response.status(200).json(filteredEvents);
  }

  const publicEvents = authorization.filterOutput("read:event:public", events)

 
  return response.status(200).json(publicEvents);
}

async function postHandler(request, response) {
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );

  const membershipObject = request.context.membership

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
