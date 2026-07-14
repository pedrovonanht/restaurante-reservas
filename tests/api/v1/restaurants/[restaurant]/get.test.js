import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST in `api/v1/restaurants/[restaurant]`", () => {
  describe("Anonymouse user", () => {
    test("With exact case match", async () => {
      const createdUser = await orchestrator.createUser({
       username: "restaurant-exact" 
      })

      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "Restaurante Case",
        max_covers: 10
      })

      await orchestrator.createMembership({
        userId: createdUser.id,
        restaurantId: createdRestaurant.id,
        role: "owner"
      })


      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/restaurante-case",
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "Restaurante Case",
        max_covers: 10,
        slug: "restaurante-case",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
    test("With non existing restaurant", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/non-existing",
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O restaurante informado não foi encontrado no sistema.",
        action: "Verifique o `slug` informado.",
        status_code: 404,
      });
    });
  });
});
