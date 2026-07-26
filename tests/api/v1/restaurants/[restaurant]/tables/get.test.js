import orchestrator from "tests/orchestrator.js";
import session from "models/session";
import { version as uuidVersion } from "uuid";


beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET in `api/v1/restaurants/[restaurant]/tables`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const createdUser = await orchestrator.createUser();

      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Restaurante No Session",
        },
      );

      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })
      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/tables`,
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

      
      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })
      const nonexistentToken =
        "87810f653db5206d69a52636161fb2452b39478885f12272fb0298730588c3dd6457b7c628df09e6bfa20f4845d8af84";

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/tables`,
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


      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/tables`,
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

  describe("Authenticated user", () => {   
    test("With `owner` membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(ownerUser.id);
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "With valid membership",
        },
      );

      const createdTable = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })
      const createdTable2 = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 02",
        minCapacity: 2,
        maxCapacity: 4
      })

      const createdTable3 = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 03",
        minCapacity: 1,
        maxCapacity: 3
      })
      await orchestrator.changeTableActive(createdTable3.id, false)

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/tables`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual([
        {
          id: responseBody[0].id,  
          name: "mesa 01",
          max_capacity: createdTable.max_capacity,  
          min_capacity: createdTable.min_capacity,
          restaurant_id: createdRestaurant.id,
          active: true,
          created_at: responseBody[0].created_at,
          updated_at: responseBody[0].updated_at,
        },
        {   
          id: responseBody[1].id,  
          name: "mesa 02",
          max_capacity: createdTable2.max_capacity,  
          min_capacity: createdTable2.min_capacity,
          restaurant_id: createdRestaurant.id,
          active: true,
          created_at: responseBody[1].created_at,
          updated_at: responseBody[1].updated_at,
        }
      ]);

      expect(uuidVersion(responseBody[0].id)).toBe(4);
      expect(Date.parse(responseBody[0].created_at)).not.toBeNaN();
      expect(Date.parse(responseBody[0].updated_at)).not.toBeNaN();

      
      // second reserve assertions
      expect(uuidVersion(responseBody[1].id)).toBe(4);
      expect(Date.parse(responseBody[1].created_at)).not.toBeNaN();
      expect(Date.parse(responseBody[1].updated_at)).not.toBeNaN();

    });

    test("Without membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Without membership",
        },
      );

      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/tables`,
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
      })
    });
    
    test("With nonexisting restaurant", async () => {
        const ownerUser = await orchestrator.createUser();
        const sessionObject = await orchestrator.createSession(ownerUser.id);
            

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/restaurante-que-nao-existe/tables`,
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
      })
    });
  });
 });
