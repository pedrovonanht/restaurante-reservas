import { ForbiddenError, NotFoundError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import authorization from "models/authorization.js";
import eventPreset from "models/event-preset.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.use(controller.injectNullOrMembership);
router.patch(controller.canUserRequest(), patchHandler);
router.delete(controller.canUserRequest(), deleteHandler);

export default router.handler(controller.errorHandlers);

async function authorizeEventPresetAccess(request) {
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );

  const membershipObject = request.context.membership; 

  if (!membershipObject) {
    throw new NotFoundError({
      message: "O preset informado não foi encontrado no sistema.",
      action: "Verifique o `id` informado.",
    });
  }

  if (!authorization.can(membershipObject, "manage:event-preset")) {
    throw new ForbiddenError({
      message: "Usuário não pode executar esta operação.",
      action:
        'Verifique se este usuário possui a feature "manage:event-preset" para esse restaurante.',
    });
  }

  return restaurantObject;
}

async function patchHandler(request, response) {
  const restaurantObject = await authorizeEventPresetAccess(request);
  const updatedPreset = await eventPreset.update(
    restaurantObject.id,
    request.query.id,
    request.body,
  );
  const filteredPreset = authorization.filterOutput(
    "read:event-preset",
    updatedPreset,
  );
  return response.status(200).json(filteredPreset);
}

async function deleteHandler(request, response) {
  const restaurantObject = await authorizeEventPresetAccess(request);
  await eventPreset.remove(restaurantObject.id, request.query.id);
  return response.status(200).json({});
}
