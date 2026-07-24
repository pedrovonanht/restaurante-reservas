import orchestrator from "tests/orchestrator.js";
import session from "models/session";
import { version as uuidVersion } from "uuid";


beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET in `api/v1/restaurants`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const response = await fetch("http://localhost:3000/api/v1/restaurants");

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
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${nonexistentToken}`,
        },
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
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
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
    test("With restaurant membership", async () => {
      const createdUser = await orchestrator.createUser({
        username: "validSession",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "Valid Memb 1",
        max_covers: 50
      })

      const createdRestaurant2 = await orchestrator.createRestaurant(createdUser.id, {
        name: "Valid Memb 2",
        max_covers: 25
      })

      const response = await fetch("http://localhost:3000/api/v1/restaurants", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual([{
        name: "Valid Memb 1",
        id: createdRestaurant.id,
        max_covers: 50,
        slug: "valid-memb-1",
        role: "owner"
      },
      {
        name: "Valid Memb 2",
        max_covers: 25,
        id: createdRestaurant2.id,
        slug: "valid-memb-2",
        role: "owner"
      }
    ]);


    expect(uuidVersion(responseBody[0].id)).toBe(4);
    expect(uuidVersion(responseBody[1].id)).toBe(4);
    });
    test("Without restaurant membership", async () => {
      const ownerUser = await orchestrator.createUser();

      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Without Memb 1",
        max_covers: 50
      })

      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);


      const response = await fetch("http://localhost:3000/api/v1/restaurants", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual([]);

    });
  });
});
