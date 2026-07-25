import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET in `api/v1/restaurants/[restaurant]/events/[id]`", () => {
  describe("Anonymous user", () => {
    test("With active event", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Id Get Active",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
        active: true,
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-id-get-active/events/${createdEvent.id}`,
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });
    });

    test("With inactive event", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Id Get Inactive",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite Cancelada",
        event_date: "2026-08-02",
        event_times: ["19:30"],
        active: false,
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-id-get-inactive/events/${createdEvent.id}`,
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O evento informado não foi encontrado no sistema.",
        action: "Verifique o `id` informado.",
        status_code: 404,
      });
    });

    test("With nonexistent restaurant", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/non-existent-events-id-get/events/8f2b1d6a-1c67-4c9f-8f8e-2a5b6c7d8e9f",
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
    test("Without membership (gets public shape)", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Id Get Non Member",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
        active: true,
      });

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-id-get-non-member/events/${createdEvent.id}`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });
    });

    test("With staff membership (full shape, no reservations)", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Id Get Staff",
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

      const staffUser = await orchestrator.createUser();
      await orchestrator.createMembership({
        userId: staffUser.id,
        restaurantId: createdRestaurant.id,
        role: "staff",
      });
      const sessionObject = await orchestrator.createSession(staffUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-id-get-staff/events/${createdEvent.id}`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
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
      });
    });

    test("With owner membership and reservations (ocupation)", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Id Get Owner Ocupation",
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
        guestPhone: "53991840001",
        reservationTime: "19:30",
        partySize: 3,
      });
      await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        eventId: createdEvent.id,
        guestName: "Ana",
        reservationTime: "19:30",
        guestPhone: "53991840002",
        partySize: 4,
      });

      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-id-get-owner-ocupation/events/${createdEvent.id}`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
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
      });
    });

    test("With owner membership on inactive event (still visible)", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Id Get Owner Inactive",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite Cancelada",
        event_date: "2026-08-02",
        event_times: ["19:30"],
        capacity: 20,
        active: false,
      });

      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-id-get-owner-inactive/events/${createdEvent.id}`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.active).toBe(false);
      expect(responseBody.ocupation).toEqual({
        reservations: 0,
        capacity: 20,
        people: 0,
      });
    });

    test("With nonexistent event id", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Events Id Get Nonexistent",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-id-get-nonexistent/events/8f2b1d6a-1c67-4c9f-8f8e-2a5b6c7d8e9f",
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
        message: "O evento informado não foi encontrado no sistema.",
        action: "Verifique o `id` informado.",
        status_code: 404,
      });
    });
  });
});
