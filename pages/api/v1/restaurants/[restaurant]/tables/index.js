import { NotFoundError } from "infra/error.js";
import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import authorization from "models/authorization.js";
import table from "models/table.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.use(controller.injectNullOrMembership);
router.get(controller.canUserRequest(), getHandler);
router.post(controller.canUserRequest(), postHandler);

export default router.handler(controller.errorHandlers);

async function authorizeTableAccess(request) {
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

  return restaurantObject;
}

async function getHandler(request, response) {
  const restaurantObject = await authorizeTableAccess(request);
  const tables = await table.findAllActiveByRestaurantId(restaurantObject.id);
  const filteredTables = authorization.filterOutput("read:table", tables);
  return response.status(200).json(filteredTables);
}

async function postHandler(request, response) {
  const restaurantObject = await authorizeTableAccess(request);
  const newTable = await table.create(restaurantObject.id, request.body);
  const filteredTable = authorization.filterOutput("read:table", newTable);
  return response.status(201).json(filteredTable);
}
