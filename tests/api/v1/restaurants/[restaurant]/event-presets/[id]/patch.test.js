import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH in `api/v1/restaurants/[restaurant]/event-presets/[id]`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Preset Patch No Session",
          max_covers: 30,
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
          capacity: 25,
        },
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-patch-no-session/event-presets/${createdPreset.id}`,
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
          name: "Preset Patch Invalid Session",
          max_covers: 30,
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
          capacity: 25,
        },
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-patch-invalid-session/event-presets/${createdPreset.id}`,
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
          name: "Preset Patch Expired Session",
          max_covers: 30,
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
          capacity: 25,
        },
      );
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      jest.useRealTimers();

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-patch-expired-session/event-presets/${createdPreset.id}`,
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
          name: "Preset Patch No Membership",
          max_covers: 30,
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
          capacity: 25,
        },
      );

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-patch-no-membership/event-presets/${createdPreset.id}`,
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
        message: "O preset informado não foi encontrado no sistema.",
        action: "Verifique o `id` informado.",
        status_code: 404,
      });
    });

    test("With staff membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Preset Patch Staff Membership",
          max_covers: 30,
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
          capacity: 25,
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
        `http://localhost:3000/api/v1/restaurants/preset-patch-staff-membership/event-presets/${createdPreset.id}`,
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
        action: `Verifique se este usuário possui a feature "manage:event-preset" para esse restaurante.`,
        status_code: 403,
      });
    });

    test("With nonexistent restaurant", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const nonexistentPresetId = "b3a1d016-1c67-4c9f-8f8e-2a5b6c7d8e9f";

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/non-existent-preset-patch/event-presets/${nonexistentPresetId}`,
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

    test("With nonexistent preset id", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Preset Patch Nonexistent Id",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);
      const nonexistentPresetId = "b3a1d016-1c67-4c9f-8f8e-2a5b6c7d8e9f";

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-patch-nonexistent-id/event-presets/${nonexistentPresetId}`,
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
        message: "O preset informado não foi encontrado no sistema.",
        action: "Verifique o `id` informado.",
        status_code: 404,
      });
    });

    test("With membership in another restaurant", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Preset Patch Cross Tenant",
        max_covers: 30,
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const otherOwnerUser = await orchestrator.createUser();
      const otherRestaurant = await orchestrator.createRestaurant(
        otherOwnerUser.id,
        {
          name: "Preset Patch Cross Tenant Other",
          max_covers: 30,
        },
      );
      const otherPreset = await orchestrator.createEventPreset(
        otherRestaurant.id,
        {
          name: "Noite de Sushi",
          event_times: ["19:30", "20:30", "21:30"],
          capacity: 25
        },
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-patch-cross-tenant/event-presets/${otherPreset.id}`,
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
        message: "O preset informado não foi encontrado no sistema.",
        action: "Verifique o `id` informado.",
        status_code: 404,
      });
    });

    test("With new `name`", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Preset Patch New Name",
          max_covers: 30,
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
          capacity: 20,
        },
      );
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-patch-new-name/event-presets/${createdPreset.id}`,
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
        id: createdPreset.id,
        name: "Noite de Fondue Especial",
        capacity: 20,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new `capacity`", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Preset Patch New Capacity",
          max_covers: 30,
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
          capacity: 20,
        },
      );
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-patch-new-capacity/event-presets/${createdPreset.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            capacity: 50,
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.capacity).toBe(50);
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With no object on request", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Preset Patch No Object",
          max_covers: 30,
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
          capacity: 25,
        },
      );
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-patch-no-object/event-presets/${createdPreset.id}`,
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
