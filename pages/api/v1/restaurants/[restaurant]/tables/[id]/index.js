import { NotFoundError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import authorization from "models/authorization.js";
import table from "models/table.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.use(controller.injectNullOrMembership);
router.patch(controller.canUserRequest(), patchHandler);

export default router.handler(controller.errorHandlers);

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

  const updatedTable = await table.update(
    restaurantObject.id,
    request.query.id,
    request.body,
  );
  const filteredTable = authorization.filterOutput("read:table", updatedTable);
  return response.status(200).json(filteredTable);
}
