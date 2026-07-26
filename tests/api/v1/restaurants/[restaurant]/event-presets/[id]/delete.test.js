import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE in `api/v1/restaurants/[restaurant]/event-presets/[id]`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Preset Delete No Session",
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
        },
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-delete-no-session/event-presets/${createdPreset.id}`,
        {
          method: "DELETE",
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
          name: "Preset Delete Invalid Session",
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
        },
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-delete-invalid-session/event-presets/${createdPreset.id}`,
        {
          method: "DELETE",
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
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Preset Delete Expired Session",
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
        },
      );
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      jest.useRealTimers();

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-delete-expired-session/event-presets/${createdPreset.id}`,
        {
          method: "DELETE",
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
    test("Without membership", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Preset Delete No Membership",
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
        },
      );

      const otherUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(otherUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-delete-no-membership/event-presets/${createdPreset.id}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
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
          name: "Preset Delete Staff Membership",
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
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
        `http://localhost:3000/api/v1/restaurants/preset-delete-staff-membership/event-presets/${createdPreset.id}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
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
        `http://localhost:3000/api/v1/restaurants/non-existent-preset-delete/event-presets/${nonexistentPresetId}`,
        {
          method: "DELETE",
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

    test("With nonexistent preset id", async () => {
      const ownerUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(ownerUser.id, {
        name: "Preset Delete Nonexistent Id",
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);
      const nonexistentPresetId = "b3a1d016-1c67-4c9f-8f8e-2a5b6c7d8e9f";

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-delete-nonexistent-id/event-presets/${nonexistentPresetId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
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
        name: "Preset Delete Cross Tenant",
      });
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const otherOwnerUser = await orchestrator.createUser();
      const otherRestaurant = await orchestrator.createRestaurant(
        otherOwnerUser.id,
        {
          name: "Preset Delete Cross Tenant Other",
        },
      );
      const otherPreset = await orchestrator.createEventPreset(
        otherRestaurant.id,
        {
          name: "Noite de Sushi",
          event_times: ["19:30", "20:30", "21:30"],
        },
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-delete-cross-tenant/event-presets/${otherPreset.id}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
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

    test("With existing preset", async () => {
      const ownerUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(
        ownerUser.id,
        {
          name: "Preset Delete Twice",
        },
      );
      const createdPreset = await orchestrator.createEventPreset(
        createdRestaurant.id,
        {
          name: "Noite de Fondue",
          event_times: ["19:30", "20:30", "21:30"],
        },
      );
      const sessionObject = await orchestrator.createSession(ownerUser.id);

      const firstResponse = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-delete-twice/event-presets/${createdPreset.id}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );
      expect(firstResponse.status).toBe(200);

      const secondResponse = await fetch(
        `http://localhost:3000/api/v1/restaurants/preset-delete-twice/event-presets/${createdPreset.id}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(secondResponse.status).toBe(404);
      const responseBody = await secondResponse.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O preset informado não foi encontrado no sistema.",
        action: "Verifique o `id` informado.",
        status_code: 404,
      });
    });
  });
});
