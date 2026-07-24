import controller from "infra/controller";
import restaurant from "models/restaurant.js";
import authorization from "models/authorization.js";
import { createRouter } from "next-connect";
import membership from "models/membership";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canUserRequest(), postHandler);
router.get(controller.canUserRequest(), getHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const requestingUser = request.context.user;
  const newRestaurant = await restaurant.create(
    requestingUser.id,
    request.body,
  );
  const filteredRestaurant = authorization.filterOutput(
    "read:restaurant",
    newRestaurant,
  );
  return response.status(201).json(filteredRestaurant);
}


async function getHandler(request, response) {
  const userMembershipsArray = await membership.findAllByUserId(request.context.user.id)

  const responseArray = await Promise.all( //espera o map async
    userMembershipsArray.map(async (membershipItem) => {
    const restaurantObject = await restaurant.findOneById(membershipItem.restaurant_id)
    const restaurantObjectWithRole = {...restaurantObject, role: membershipItem.role}

    return authorization.filterOutput("read:restaurant:self", restaurantObjectWithRole)
  })
)
  return response.status(200).json(responseArray)
}

