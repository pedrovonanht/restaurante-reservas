import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH in `api/v1/restaurants/[restaurant]/events/[id]`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Patch No Session",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-patch-no-session/events/${createdEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Noite de Fondue Atualizada",
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
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Patch Invalid Session",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-patch-invalid-session/events/${createdEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${nonexistentToken}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue Atualizada",
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
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Patch Expired Session",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      jest.useRealTimers();

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-patch-expired-session/events/${createdEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue Atualizada",
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
          name: "Events Patch No Membership",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-patch-no-membership/events/${createdEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue Atualizada",
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
        name: "Events Patch Alvo Alheio",
        max_covers: 30,
      });

      const otherOwnerUser = await orchestrator.createUser();
      const otherRestaurant = await orchestrator.createRestaurant(
        otherOwnerUser.id,
        {
          name: "Events Patch Outro Dono",
          max_covers: 30,
        },
      );
      await orchestrator.createMembership({
        userId: otherOwnerUser.id,
        restaurantId: otherRestaurant.id,
        role: "owner",
      });
      const createdEvent = await orchestrator.createEvent(otherRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });

      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-patch-outro-dono/events/${createdEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue Atualizada",
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
          name: "Events Patch Staff Membership",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });

      const staffUser = await orchestrator.createUser();
      await orchestrator.createMembership({
        userId: staffUser.id,
        restaurantId: createdRestaurant.id,
        role: "staff",
      });
      const sessionObject = await orchestrator.createSession(staffUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-patch-staff-membership/events/${createdEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue Atualizada",
          }),
        },
      );

      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não pode executar esta operação.",
        action: `Verifique se este usuário possui a feature "update:event" para esse restaurante.`,
        status_code: 403,
      });
    });

    test("With nonexistent restaurant", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/non-existent-events-patch/events/8f2b1d6a-1c67-4c9f-8f8e-2a5b6c7d8e9f",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Não Importa",
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

    test("With nonexistent event id", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Events Patch Nonexistent Id",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/restaurants/events-patch-nonexistent-id/events/8f2b1d6a-1c67-4c9f-8f8e-2a5b6c7d8e9f",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Não Importa",
          }),
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

    test("With new `name`", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Patch New Name",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
        capacity: 20,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-patch-new-name/events/${createdEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Noite de Fondue Especial",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "Noite de Fondue Especial",
        event_date: "2026-08-01",
        event_times: ["19:30"],
        capacity: 20,
        active: true,
        preset_id: null,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("Toggling `active` to false", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Patch Toggle Active",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-patch-toggle-active/events/${createdEvent.id}`,
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
      expect(responseBody.active).toBe(false);
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new `event_date`", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Patch New Date",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-patch-new-date/events/${createdEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            event_date: "2026-08-15",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.event_date).toBe("2026-08-15");
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With no object on request", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Events Patch No Object",
          max_covers: 30,
        },
      );
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        name: "Noite de Fondue",
        event_date: "2026-08-01",
        event_times: ["19:30"],
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/events-patch-no-object/events/${createdEvent.id}`,
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
