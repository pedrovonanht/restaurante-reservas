import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST in `api/v1/restaurants/[restaurant]/tables`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables No Session",
        max_covers: 30,
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-no-session/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
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

      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables Invalid Session",
        max_covers: 30,
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-invalid-session/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${nonexistentToken}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
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

      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables Expired Session",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      jest.useRealTimers();

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-expired-session/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
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

  describe("Authenticated user", () => {
    test("Without membership", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables No Membership",
        max_covers: 30,
      });

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-no-membership/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
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

    test("With membership in another restaurant", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables Alvo Alheio",
        max_covers: 30,
      });

      const otherOwnerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(
        otherOwnerUser.id,
        {
          name: "Tables Outro Dono",
          max_covers: 30,
        },
      );

      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-outro-dono/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
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

    test("With nonexistent restaurant", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/non-existent/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
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

    test("With valid data", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables Valid Data",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-valid-data/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
          }),
        },
      );

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        restaurant_id: responseBody.restaurant_id,
        name: "mesa 01",
        active: true,
        min_capacity: 4,
        max_capacity: 6,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(uuidVersion(responseBody.restaurant_id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With missing `max_capacity`", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables no max capacity",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-no-max-capacity/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Campo `max_capacity` é obrigatório em tables",
        action: "Tente novamente informando um `max_capacity`",
        status_code: 400
      })
    });

    test("With no `min_capacity`", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables no min capacity",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-no-min-capacity/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            max_capacity: 6,
          }),
        },
      );

    expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        restaurant_id: responseBody.restaurant_id,
        name: "mesa 01",
        min_capacity: 1,
        max_capacity: 6,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(uuidVersion(responseBody.restaurant_id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With `min_capacity` bigger than `max_capacity`", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables min capacity greather",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-min-capacity-greather/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 6,
            max_capacity: 4,
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O minimo da capacidade não pode ser maior do que o máximo",
        action: "Tente novamente informando um novo `min_capacity`",
        status_code: 400
      })
    });

    test("With duplicated `name`", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables Duplicated Name",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-duplicated-name/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
          }),
        },
      );
      expect(response.status).toBe(201)


      const response2 = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-duplicated-name/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
          }),
        },
      );
      expect(response2.status).toBe(400);
      const responseBody = await response2.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Já existe uma mesa com essa nome.",
        action: "Tente novamente informando um outro `name`.",
        status_code: 400
      })
    });
    test("With duplicated `name` with inactive table", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Tables Duplicated Name",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-duplicated-name/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
          }),
        },
      );
      expect(response.status).toBe(201)

      const responseBody = await response.json();
      orchestrator.changeTableActive(responseBody.id, false)

      const response2 = await fetch(
        "http://localhost:3000/api/v1/restaurants/tables-duplicated-name/tables",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 01",
            min_capacity: 4,
            max_capacity: 6,
          }),
        },
      );
      expect(response2.status).toBe(201);
      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        id: response2Body.id,
        restaurant_id: response2Body.restaurant_id,
        name: "mesa 01",
        min_capacity: 4,
        max_capacity: 6,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
    });
  });
});
