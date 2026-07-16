import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH in `api/v1/restaurants/[restaurant]`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(createdUser.id, {
        name: "no Session 1",
        max_covers: 24,
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/no-session-1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Restaurante Sem Sessão",
          }),
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

    test("With invalid session token", async () => {
      const nonexistentToken =
        "87810f653db5206d69a52636161fb2452b39478885f12272fb0298730588c3dd6457b7c628df09e6bfa20f4845d8af84";

      const createdUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(createdUser.id, {
        name: "invalid Session 1",
        max_covers: 24,
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/invalid-session-1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${nonexistentToken}`,
          },
          body: JSON.stringify({
            name: "Restaurante Token Inválido",
          }),
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
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(createdUser.id, {
        name: "Expired Restaurant",
        max_covers: 24,
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/expired-restaurant",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            max_covers: 30,
          }),
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
    test("Without membership", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Sem Membership",
        max_covers: 24,
      });

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/sem-membership",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            max_covers: 30,
          }),
        },
      );

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não pode executar esta operação.",
        action: `Verifique se este usuário possui a feature "update:restaurant" para esse restaurante.`,
        status_code: 403,
      });
    });

    test("With membership in another restaurant", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Alvo Membership Alheio",
        max_covers: 24,
      });

      const otherOwnerUser = await orchestrator.createUser();
      const otherRestaurant = await orchestrator.createRestaurant(
        otherOwnerUser.id,
        {
          name: "Restaurante Do Outro Dono Patch",
          max_covers: 24,
        },
      );
      await orchestrator.createMembership({
        userId: otherOwnerUser.id,
        restaurantId: otherRestaurant.id,
        role: "owner",
      });

      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/restaurante-do-outro-dono-patch",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            max_covers: 30,
          }),
        },
      );

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não pode executar esta operação.",
        action: `Verifique se este usuário possui a feature "update:restaurant" para esse restaurante.`,
        status_code: 403,
      });
    });

    test("With staff Membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Restaurante Staff Patch",
          max_covers: 24,
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
        "http://localhost:3000/api/v1/restaurants/restaurante-staff-patch",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            max_covers: 30,
          }),
        },
      );

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não pode executar esta operação.",
        action: `Verifique se este usuário possui a feature "update:restaurant" para esse restaurante.`,
        status_code: 403,
      });
    });

    test("With nonexistent restaurant", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/non-exists",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "notExist",
          }),
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

    test("With duplicated name", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);
      await orchestrator.createRestaurant(createdUser.id, {
        name: "Duplicado 1",
        max_covers: 24,
      });
      await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Duplicado 12",
          max_covers: 24,
        },
      );

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/duplicado-12",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Duplicado 1",
          }),
        },
      );
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O nome informado já está sendo utilizado.",
        action: "Utilize outro nome para realizar essa operação!",
        status_code: 400,
      });
    });

    test("With no object on request", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);
      await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "No Object",
          max_covers: 24,
        },
      );
      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/no-object",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({}),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "A requisição espera um objeto, que não foi enviado.",
        action: "Verifique o corpo da requisição.",
        status_code: 400,
      });
    });

    test("With unique name", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);
      await orchestrator.createRestaurant(createdUser.id, {
        name: "Valido 1",
        max_covers: 24,
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/valido-1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Valido 2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "Valido 2",
        slug: "valido-2",
        max_covers: 24,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'max_covers'", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);
      await orchestrator.createRestaurant(createdUser.id, {
        name: "maxCovert 1",
        max_covers: 24,
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/maxcovert-1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            max_covers: 100,
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "maxCovert 1",
        slug: "maxcovert-1",
        max_covers: 100,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
});
