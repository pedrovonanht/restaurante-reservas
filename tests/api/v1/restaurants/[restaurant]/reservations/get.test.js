import orchestrator from "tests/orchestrator.js";
import session from "models/session";
import { version as uuidVersion } from "uuid";


beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET in `api/v1/restaurants/[restaurant]/reservations`", () => {
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

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/reservations`,
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

      const nonexistentToken =
        "87810f653db5206d69a52636161fb2452b39478885f12272fb0298730588c3dd6457b7c628df09e6bfa20f4845d8af84";

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/reservations`,
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
          max_covers: 10,
        },
      );

      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/reservations`,
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
          max_covers: 30,
        },
      );

      const created_event = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
        active: true,
      });

      await orchestrator.createdTable({
        restaurantId: createdRestaurant.id,
        name: "Mesa 01",
        maxCapacity: 4,
        minCapacity: 2
      })

       await orchestrator.createdTable({
        restaurantId: createdRestaurant.id,
        name: "Mesa 02",
        maxCapacity: 2,
        minCapacity:1
      })

      
      await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        eventId: created_event.id,
        reservationTime: "19:30",
        guestName: "Pedro",
        guestPhone: "53991841963",
        partySize: 3,
      })

      await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        eventId: created_event.id,
        reservationTime: "19:30",
        guestName: "Filipe",
        guestPhone: "43991841964",
        partySize: 1,
      })

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/reservations`,
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
          guest_phone: "53991841963",
          guest_name: "Pedro",
          party_size: 1,
          table_name: "Mesa 01",
          event: {
            id: created_event.id,
            event_date: created_event.event_date,
            name: created_event.name,
            capacity: created_event.capacity
          },
          restaurant_id: createdRestaurant.id,
          reservation_time: "19:30",
          public_token: responseBody[0].public_token,
          created_at: responseBody[0].created_at,
          updated_at: responseBody[0].updated_at,
        },
        {   
          id: responseBody[1].id,  
          guest_phone: "43991841964",
          guest_name: "Filipe",
          party_size: 1,
          table_name: "Mesa 02",
          event: {
            id: created_event.id,
            event_date: created_event.event_date,
            name: created_event.name,
            capacity: created_event.capacity
          },
          restaurant_id: createdRestaurant.id,
          reservation_time: "19:30",
          public_token: responseBody[1].public_token,
          created_at: responseBody[1].created_at,
          updated_at: responseBody[1].updated_at,
        }
      ]);

      expect(uuidVersion(responseBody[0].id)).toBe(4);
      expect(Date.parse(responseBody[0].created_at)).not.toBeNaN();
      expect(Date.parse(responseBody[0].updated_at)).not.toBeNaN();

      expect(responseBody[0].public_token.length).toBe(43)
      
      // second reserve assertions
      expect(uuidVersion(responseBody[1].id)).toBe(4);
      expect(Date.parse(responseBody[1].created_at)).not.toBeNaN();
      expect(Date.parse(responseBody[1].updated_at)).not.toBeNaN();

      expect(responseBody[1].public_token.length).toBe(43)
    });

    test("Without membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Without membership",
          max_covers: 30,
        },
      );

      const created_event = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
        active: true,
      });

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      await orchestrator.createdTable({
        restaurantId: createdRestaurant.id,
        name: "Mesa 01",
        maxCapacity: 4
      })
      
      await orchestrator.createdTable({
        restaurantId: createdRestaurant.id,
        name: "Mesa 02",
        maxCapacity: 4
      })


      await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        eventId: created_event.id,
        guestName: "Pedro",
        guestPhone: "53991841963",
        partySize: 1,
        reservationTime: "19:30",
      })

      await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        eventId: created_event.id,
        guestName: "Filipe",
        guestPhone: "43991841964",
        partySize: 1,
        reservationTime: "19:30",
      })

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/reservations`,
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

        await orchestrator.createRestaurant(
            ownerUser.id,
            {
                name: "non Existing",
                max_covers: 30,
            },
        );
            

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/restaurante-que-nao-existe/reservations`,
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

    test("With query string for time search", async () => {
      const ownerUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(ownerUser.id);
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "With query string membership",
          max_covers: 30,
        },
      );

      const created_event = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
        active: true,
      });

      const created_event2 = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-09-02",
        event_times: ["19:30"],
        active: true,
      });

      await orchestrator.createdTable({
        restaurantId: createdRestaurant.id,
        name: "Mesa 01",
        maxCapacity: 4,
        minCapacity: 2
      })

      await orchestrator.createdTable({
        restaurantId: createdRestaurant.id,
        name: "Mesa 02",
        maxCapacity: 2,
        minCapacity: 1
      })

      
      await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        eventId: created_event.id,
        reservationTime: "19:30",
        guestName: "Pedro",
        guestPhone: "53991841963",
        partySize: 3,
      })

      await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        eventId: created_event2.id,
        reservationTime: "19:30",
        guestName: "Filipe",
        guestPhone: "43991841964",
        partySize: 1,
      })

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/reservations?from=2026-08-01&to=2026-08-01`,
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
          guest_phone: "53991841963",
          guest_name: "Pedro",
          party_size: 1,
          table_name: "Mesa 01",
          event: {
            id: created_event.id,
            event_date: created_event.event_date,
            name: created_event.name,
            capacity: created_event.capacity
          },
          restaurant_id: createdRestaurant.id,
          reservation_time: "19:30",
          public_token: responseBody[0].public_token,
          created_at: responseBody[0].created_at,
          updated_at: responseBody[0].updated_at,
        }
      ]);

      expect(uuidVersion(responseBody[0].id)).toBe(4);
      expect(Date.parse(responseBody[0].created_at)).not.toBeNaN();
      expect(Date.parse(responseBody[0].updated_at)).not.toBeNaN();

      expect(responseBody[0].public_token.length).toBe(43)
    });
  });
 });
