import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import session from "models/session";
import membership from "models/membership.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST in `api/v1/restaurants`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const response = await fetch("http://localhost:3000/api/v1/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Restaurante Sem Sessão",
          slug: "restaurante-sem-sessao",
          max_covers: 30,
        }),
      });

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

      const response = await fetch("http://localhost:3000/api/v1/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${nonexistentToken}`,
        },
        body: JSON.stringify({
          name: "Restaurante Token Inválido",
          slug: "restaurante-token-invalido",
          max_covers: 30,
        }),
      });

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

      const createdUser = await orchestrator.createUser({
        username: "expiredSessionRestaurant",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          name: "Restaurante Sessão Expirada",
          slug: "restaurante-sessao-expirada",
          max_covers: 30,
        }),
      });

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

  describe("Authenticated user", () => {
    test("With missing `name`", async () => {
      const createdUser = await orchestrator.createUser({
        username: "missingNameRestaurant",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          slug: "restaurante-sem-nome",
          max_covers: 30,
        }),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O campo `name` é obrigatório.",
        action: "Tente novamente informando um `name`",
        status_code: 400,
      });
    });

    test("With missing `slug`", async () => {
      const createdUser = await orchestrator.createUser({
        username: "missingSlugRestaurant",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          name: "Restaurante Sem Slug",
          max_covers: 30,
        }),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O campo `slug` é obrigatório.",
        action: "Tente novamente informando um `slug`",
        status_code: 400,
      });
    });

    test("With missing `max_covers`", async () => {
      const createdUser = await orchestrator.createUser({
        username: "missingMaxCoversRestaurant",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          name: "Restaurante Sem Max Covers",
          slug: "restaurante-sem-max-covers",
        }),
      });

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O campo `max_covers` é obrigatório.",
        action: "Tente novamente informando um `max_covers`",
        status_code: 400,
      });
    });

    test("With duplicated name", async () => {
      const createdUser = await orchestrator.createUser({
        username: "duplicatedNameRestaurant",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response1 = await fetch(
        "http://localhost:3000/api/v1/restaurants",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Primeiro Restaurante",
            slug: "slug-repetido",
            max_covers: 30,
          }),
        },
      );
      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/restaurants",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Primeiro Restaurante",
            slug: "slug-repetido",
            max_covers: 50,
          }),
        },
      );
      expect(response2.status).toBe(400);

      const responseBody = await response2.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O slug informado já está sendo utilizado.",
        action: "Utilize outro slug para realizar essa operação!",
        status_code: 400,
      });
    });

    test("With valid data", async () => {
      const createdUser = await orchestrator.createUser({
        username: "validRestaurantOwner",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          name: "Restaurante Válido",
          slug: "restaurante-valido",
          max_covers: 40,
        }),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "Restaurante Válido",
        slug: "restaurante-valido",
        max_covers: 40,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const membershipInDatabase =
        await membership.findOneByRestaurantIdAndUserId(
          responseBody.id,
          createdUser.id,
        );

      expect(membershipInDatabase.role).toBe("owner");
      expect(membershipInDatabase.user_id).toBe(createdUser.id);
      expect(membershipInDatabase.restaurant_id).toBe(responseBody.id);
      expect(uuidVersion(membershipInDatabase.id)).toBe(4);
    });
  });
});
