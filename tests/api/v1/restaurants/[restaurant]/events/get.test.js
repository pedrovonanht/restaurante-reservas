import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET in `api/v1/restaurants/[restaurant]/events`", () => {
  describe("Anonymous user", () => {
    test("With mixed active and inactive events", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Get Mixed Active",
          max_covers: 30,
        },
      );

      await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
        active: true,
      });
      await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite Cancelada",
        event_date: "2026-08-02",
        event_times: ["19:30"],
        active: false,
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-get-mixed-active/events",
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual([
        {
          name: "Noite de Fondue",
          event_date: "2026-08-01",
          event_times: ["19:30"],
        },
      ]);
    });

    test("With no events", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Events Get No Events",
        max_covers: 30,
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-get-no-events/events",
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual([]);
    });

    test("With nonexistent restaurant", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/non-existent-events-get/events",
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
  });

  describe("Authenticated user", () => {
    test("Without membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Get Non Member",
          max_covers: 30,
        },
      );

      await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
        active: true,
      });
      await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite Cancelada",
        event_date: "2026-08-02",
        event_times: ["19:30"],
        active: false,
      });

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-get-non-member/events",
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
          name: "Noite de Fondue",
          event_date: "2026-08-01",
          event_times: ["19:30"],
        },
      ]);
    });

    test("With staff membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Get Staff Full",
          max_covers: 30,
        },
      );

      const createdEvent = await orchestrator.createEvent(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_date: "2026-08-01",
          event_times: ["19:30"],
          capacity: 20,
          active: true,
        },
      );
      const createdInactiveEvent = await orchestrator.createEvent(
        createdRestaurant.id,
        {
          name: "Noite Cancelada",
          event_date: "2026-08-02",
          event_times: ["19:30"],
          capacity: 20,
          active: false,
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
        "http://localhost:3000/api/v1/restaurants/events-get-staff-full/events",
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
          id: createdEvent.id,
          name: "Noite de Fondue",
          event_date: "2026-08-01",
          event_times: ["19:30"],
          capacity: 20,
          active: true,
          preset_id: null,
          ocupation: { reservations: 0, capacity: 20, people: 0 },
          created_at: createdEvent.created_at,
          updated_at: createdEvent.updated_at,
        },
        {
          id: createdInactiveEvent.id,
          name: "Noite Cancelada",
          event_date: "2026-08-02",
          event_times: ["19:30"],
          capacity: 20,
          active: false,
          preset_id: null,
          ocupation: { reservations: 0, capacity: 20, people: 0 },
          created_at: createdInactiveEvent.created_at,
          updated_at: createdInactiveEvent.updated_at,
        },
      ]);
    });

    test("With owner membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Get Owner Full",
          max_covers: 30,
        },
      );

      const createdEvent = await orchestrator.createEvent(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_date: "2026-08-01",
          event_times: ["19:30"],
          capacity: 20,
          active: true,
        },
      );
      const createdInactiveEvent = await orchestrator.createEvent(
        createdRestaurant.id,
        {
          name: "Noite Cancelada",
          event_date: "2026-08-02",
          event_times: ["19:30"],
          capacity: 20,
          active: false,
        },
      );

      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-get-owner-full/events",
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
          id: createdEvent.id,
          name: "Noite de Fondue",
          event_date: "2026-08-01",
          event_times: ["19:30"],
          capacity: 20,
          active: true,
          preset_id: null,
          ocupation: { reservations: 0, capacity: 20, people: 0 },
          created_at: createdEvent.created_at,
          updated_at: createdEvent.updated_at,
        },
        {
          id: createdInactiveEvent.id,
          name: "Noite Cancelada",
          event_date: "2026-08-02",
          event_times: ["19:30"],
          capacity: 20,
          active: false,
          preset_id: null,
          ocupation: { reservations: 0, capacity: 20, people: 0 },
          created_at: createdInactiveEvent.created_at,
          updated_at: createdInactiveEvent.updated_at,
        },
      ]);
    });

    test("With owner membership and reservations (ocupation)", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Get Owner Ocupation",
          max_covers: 30,
        },
      );

      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
        capacity: 20,
        active: true,
      });

      await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        eventId: createdEvent.id,
        guestName: "Pedro",
        reservationTime: "19:30",
        guestPhone: "53991840101",
        partySize: 2,
      });
      await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        eventId: createdEvent.id,
        guestName: "Ana",
        reservationTime: "19:30",
        guestPhone: "53991840102",
        partySize: 5,
      });

      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-get-owner-ocupation/events",
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
          id: createdEvent.id,
          name: "Noite de Fondue",
          event_date: "2026-08-01",
          event_times: ["19:30"],
          capacity: 20,
          active: true,
          preset_id: null,
          ocupation: { reservations: 2, capacity: 20, people: 7 },
          created_at: createdEvent.created_at,
          updated_at: createdEvent.updated_at,
        },
      ]);
    });

    test("With nonexistent restaurant", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/non-existent-events-get-authenticated/events",
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
  });
});
