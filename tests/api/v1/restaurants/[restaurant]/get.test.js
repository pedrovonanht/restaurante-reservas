import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET in `api/v1/restaurants/[restaurant]`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const createdUser = await orchestrator.createUser();

      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Restaurante No Session",
        },
      );

      await orchestrator.createMembership({
        userId: createdUser.id,
        restaurantId: createdRestaurant.id,
        role: "owner",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/restaurante-no-session",
        {},
      );

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Sessão inválida.",
        action: "Verifique se o usuário está logado.",
        status_code: 401,
      });
    });

    test("With invalid session token", async () => {
      const createdUser = await orchestrator.createUser();

      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Restaurante Invalid",
        },
      );

      await orchestrator.createMembership({
        userId: createdUser.id,
        restaurantId: createdRestaurant.id,
        role: "owner",
      });
      const nonexistentToken =
        "87810f653db5206d69a52636161fb2452b39478885f12272fb0298730588c3dd6457b7c628df09e6bfa20f4845d8af84";

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/restaurante-invalid",
        {
          headers: {
            Cookie: `session_id=${nonexistentToken}`,
          },
        },
      );

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Sessão inválida.",
        action: "Verifique se o usuário está logado.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      const createdUser = await orchestrator.createUser();

      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Restaurante Expired",
        },
      );

      await orchestrator.createMembership({
        userId: createdUser.id,
        restaurantId: createdRestaurant.id,
        role: "owner",
      });

      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/restaurante-expired",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Sessão inválida.",
        action: "Verifique se o usuário está logado.",
        status_code: 401,
      });
    });
  });

  describe("Authenticated User", () => {
    test("With invalid Membership", async () => {
      const ownerUser = await orchestrator.createUser();

      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Restaurante Invalid Membership",
      });

      const outsiderUser = await orchestrator.createUser();
      const createdSession = await orchestrator.createSession(outsiderUser.id);
      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/restaurante-invalid-membership",
        {
          headers: {
            Cookie: `session_id=${createdSession.token}`,
          },
        },
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O `slug` informado não foi encontrado no sistema.",
        action: "Verifique o `slug` informado.",
        status_code: 404,
      });
    });

    test("With valid Membership", async () => {
      const createdUser = await orchestrator.createUser({
        username: "restaurant-exact",
      });

      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Restaurante Case",
        },
      );

      await orchestrator.createMembership({
        userId: createdUser.id,
        restaurantId: createdRestaurant.id,
        role: "owner",
      });

      const createdSession = await orchestrator.createSession(createdUser.id);
      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/restaurante-case",
        {
          headers: {
            Cookie: `session_id=${createdSession.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "Restaurante Case",
        slug: "restaurante-case",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With non existing restaurant", async () => {
      const createdUser = await orchestrator.createUser();

      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Restaurantesas",
        },
      );

      await orchestrator.createMembership({
        userId: createdUser.id,
        restaurantId: createdRestaurant.id,
        role: "owner",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/non-existing",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O `slug` informado não foi encontrado no sistema.",
        action: "Verifique o `slug` informado.",
        status_code: 404,
      });
    });

    test("With membership in another restaurant", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Restaurante Alheio",
      });

      const otherOwnerUser = await orchestrator.createUser();
      const otherRestaurant = await orchestrator.createRestaurant(
        otherOwnerUser.id,
        {
          name: "Restaurante Do Outro Dono",
        },
      );
      await orchestrator.createMembership({
        userId: otherOwnerUser.id,
        restaurantId: otherRestaurant.id,
        role: "owner",
      });

      const sessionObject = await orchestrator.createSession(ownerUser.id);
      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/restaurante-do-outro-dono",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O `slug` informado não foi encontrado no sistema.",
        action: "Verifique o `slug` informado.",
        status_code: 404,
      });
    });

    test("With staff Membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Restaurante Staff",
        },
      );

      const staffUser = await orchestrator.createUser();
      await orchestrator.createMembership({
        userId: staffUser.id,
        restaurantId: createdRestaurant.id,
        role: "staff",
      });

      const sessionObject = await orchestrator.createSession(staffUser.id);
      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/restaurante-staff",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "Restaurante Staff",
        slug: "restaurante-staff",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });
  });
});
