import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST in `api/v1/restaurants/[restaurant]/events`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Events Post No Session",
        max_covers: 30,
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-no-session/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30", "20:30"],
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
        name: "Events Post Invalid Session",
        max_covers: 30,
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-invalid-session/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${nonexistentToken}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30", "20:30"],
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
        name: "Events Post Expired Session",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      jest.useRealTimers();

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-expired-session/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30", "20:30"],
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
        name: "Events Post No Membership",
        max_covers: 30,
      });

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-no-membership/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30", "20:30"],
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
        name: "Events Post Alvo Alheio",
        max_covers: 30,
      });

      const otherOwnerUser = await orchestrator.createUser();
      const otherRestaurant = await orchestrator.createRestaurant(
        otherOwnerUser.id,
        {
          name: "Events Post Outro Dono",
          max_covers: 30,
        },
      );
      await orchestrator.createMembership({
        userId: otherOwnerUser.id,
        restaurantId: otherRestaurant.id,
        role: "owner",
      });

      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-outro-dono/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30", "20:30"],
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

    test("With staff membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Post Staff Membership",
          max_covers: 30,
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
        "http://localhost:3000/api/v1/restaurants/events-post-staff-membership/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30", "20:30"],
          }),
        },
      );

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não pode executar esta operação.",
        action: `Verifique se este usuário possui a feature "create:event" para esse restaurante.`,
        status_code: 403,
      });
    });

    test("With nonexistent restaurant", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/non-existent-events-post/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30", "20:30"],
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

    test("With valid data and credentials", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Events Post Valid Data",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-valid-data/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30", "20:30"],
            capacity: 20,
          }),
        },
      );

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30", "20:30"],
        capacity: 20,
        active: true,
        preset_id: null,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With omitted `capacity` defaulting to the restaurant's `max_covers`", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Events Post Capacity Default",
        max_covers: 45,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-capacity-default/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30"],
          }),
        },
      );

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody.capacity).toBe(45);
    });

    test("With explicit `capacity`", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Events Post Capacity Explicit",
        max_covers: 45,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-capacity-explicit/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30"],
            capacity: 12,
          }),
        },
      );

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody.capacity).toBe(12);
    });

    test("With valid `preset_id`", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Post With Preset",
          max_covers: 30,
        },
      );
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          capacity: 25,
          event_times: ["19:30", "20:30", "21:30"]
        },
      );

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-with-preset/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: ["19:30"],
            preset_id: createdPreset.id,
          }),
        },
      );

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody.preset_id).toBe(createdPreset.id);
    });

    test("With missing `name`", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Events Post Missing Name",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-missing-name/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            event_date: "2026-08-01",
            event_times: ["19:30"],
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O campo `name` é obrigatório.",
        action: "Tente novamente informando um `name`",
        status_code: 400,
      });
    });

    test("With missing `event_date`", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Events Post Missing Event Date",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-missing-event-date/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_times: ["19:30"],
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O campo `event_date` é obrigatório.",
        action: "Tente novamente informando um `event_date`",
        status_code: 400,
      });
    });

    test("With missing `event_times`", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Events Post Missing Event Times",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-post-missing-event-times/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue",
            event_date: "2026-08-01",
            event_times: [],
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O campo `event_times` é obrigatório.",
        action: "Tente novamente informando um `event_times`",
        status_code: 400,
      });
    });
  });
});
