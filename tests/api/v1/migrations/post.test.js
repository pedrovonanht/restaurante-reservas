import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST in `api/v1/migrations`", () => {
  describe("With anonymouse user", () => {
    test("With no Session", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
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
  describe("With Default User", () => {
    test("Without feature create:migrations", async () => {
      const createdUser = await orchestrator.createUser();
      const createdSession = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
        method: "POST",
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não pode executar esta operação.",
        action: `Verifique se este usuário possui a feature "create:migrations".`,
        status_code: 403,
      });
    });
  });
  describe("With Privileged User", () => {
    test("For the first time", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.promoteUserToAdmin(createdUser.id);
      const createdSession = await orchestrator.createSession(createdUser.id);
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
        method: "POST",
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual([]);
    });
    test("For the second time", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.promoteUserToAdmin(createdUser.id);
      const createdSession = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
        method: "POST",
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual([]);
    });
  });
});
