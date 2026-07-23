import { ForbiddenError, NotFoundError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import authorization from "models/authorization.js";
import eventPreset from "models/event-preset.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.use(controller.injectNullOrMembership);
router.get(controller.canUserRequest(), getHandler);
router.post(controller.canUserRequest(), postHandler);

export default router.handler(controller.errorHandlers);

async function authorizeEventPresetAccess(request) {
  const restaurantObject = await restaurant.findOneBySlug(
    request.query.restaurant,
  );

  const membershipObject = request.context.membership

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

async function getHandler(request, response) {
  const restaurantObject = await authorizeEventPresetAccess(request);
  const presets = await eventPreset.findAllByRestaurantId(restaurantObject.id);
  const filteredPresets = presets.map((presetObject) =>
    authorization.filterOutput("read:event-preset", presetObject),
  );
  return response.status(200).json(filteredPresets);
}

async function postHandler(request, response) {
  const restaurantObject = await authorizeEventPresetAccess(request);
  const newPreset = await eventPreset.create(restaurantObject.id, request.body);
  const filteredPreset = authorization.filterOutput(
    "read:event-preset",
    newPreset,
  );
  return response.status(201).json(filteredPreset);
}
