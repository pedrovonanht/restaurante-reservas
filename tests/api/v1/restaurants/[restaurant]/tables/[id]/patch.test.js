import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH in `api/v1/restaurants/[restaurant]/tables/[id]`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const createdUser = await orchestrator.createUser();

      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Restaurante No Session",
          max_covers: 10,
        },
      );

      const createdTable = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })
      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/tables/${createdTable.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "mesa 02",
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
      const createdUser = await orchestrator.createUser();

      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Restaurante Invalid",
          max_covers: 10,
        },
      );

      
      const createdTable = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })
      const nonexistentToken =
        "87810f653db5206d69a52636161fb2452b39478885f12272fb0298730588c3dd6457b7c628df09e6bfa20f4845d8af84";

        const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/tables/${createdTable.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${nonexistentToken}`
          },
          body: JSON.stringify({
            name: "mesa 02",
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
      const createdUser = await orchestrator.createUser();

      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Restaurante Expired",
          max_covers: 10,
        },
      );


      const createdTable = await orchestrator.createTable({
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
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/tables/${createdTable.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`
          },
          body: JSON.stringify({
            name: "mesa 02",
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
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Without membership",
          max_covers: 30,
        },
      );
      const createdTable = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/without-membership/tables/${createdTable.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 02",
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
        `http://localhost:3000/api/v1/restaurants/without-membership/tables/non-existent-id`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 02",
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

    test("With nonexistent table id", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "Without Table",
          max_covers: 30,
        },
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/tables/non-existent-id`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 02",
          }),
        },
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "A mesa informado não foi encontrado no sistema.",
        action: "Verifique o `id` informado.",
        status_code: 404,
      });
    });

    test("With new `name`", async () => {
    const createdUser = await orchestrator.createUser();
    const sessionObject = await orchestrator.createSession(createdUser.id)
      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "With new name",
          max_covers: 30,
        },
      );
      const createdTable = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })


      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/with-new-name/tables/${createdTable.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 02",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        restaurant_id: createdRestaurant.id,
        name: "mesa 02",
        min_capacity: 4,
        max_capacity: 6,
        active: true,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("Toggling `active` to false", async () => {
      const createdUser = await orchestrator.createUser();
    const sessionObject = await orchestrator.createSession(createdUser.id)
      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "With new active",
          max_covers: 30,
        },
      );
      const createdTable = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })


      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/with-new-active/tables/${createdTable.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            active: false,
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.active).toBe(false)
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new `min_capacity`", async () => {
      const createdUser = await orchestrator.createUser();
    const sessionObject = await orchestrator.createSession(createdUser.id)
      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "With new min capacity",
          max_covers: 30,
        },
      );
      const createdTable = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })


      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/with-new-min-capacity/tables/${createdTable.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            min_capacity: 5,
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        restaurant_id: createdRestaurant.id,
        name: "mesa 01",
        min_capacity: 5,
        max_capacity: 6,
        active: true,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new `max_capacity`", async () => {
      const createdUser = await orchestrator.createUser();
    const sessionObject = await orchestrator.createSession(createdUser.id)
      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "With new max capacity",
          max_covers: 30,
        },
      );
      const createdTable = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })


      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/with-new-max-capacity/tables/${createdTable.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            max_capacity: 8,
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        restaurant_id: createdRestaurant.id,
        name: "mesa 01",
        min_capacity: 4,
        max_capacity: 8,
        active: true,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With duplicated `name`", async () => {
    const createdUser = await orchestrator.createUser();
    const sessionObject = await orchestrator.createSession(createdUser.id)
      const createdRestaurant = await orchestrator.createRestaurant(
        createdUser.id,
        {
          name: "With duplicated name",
          max_covers: 30,
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
        minCapacity: 4,
        maxCapacity: 6
      })


      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/with-duplicated-name/tables/${createdTable.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 02",
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Já existe uma mesa com essa nome.",
        action: "Tente novamente informando um outro `name`.",
        status_code: 400
      })

      // non active table name duplication assertions
      orchestrator.changeTableActive(createdTable2.id, false);
      const response2 = await fetch(
        `http://localhost:3000/api/v1/restaurants/with-duplicated-name/tables/${createdTable.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "mesa 02",
          }),
        },
      );

       expect(response2.status).toBe(200);
      const responseBody2 = await response2.json();
      expect(responseBody2).toEqual({
        id: responseBody2.id,
        restaurant_id: createdRestaurant.id,
        name: "mesa 02",
        min_capacity: 4,
        max_capacity: 6,
        active: true,
        created_at: responseBody2.created_at,
        updated_at: responseBody2.updated_at,
      });
      expect(responseBody2.updated_at > responseBody2.created_at).toBe(true);
    })

    test("With no object on request", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "No object",
          max_covers: 30,
        },
      );
      const sessionObject = await orchestrator.createSession(ownerUser.id);
      const createdTable = await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 3,
        maxCapacity: 6
      })
      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/no-object/tables/${createdTable.id}`,
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
  });
});
