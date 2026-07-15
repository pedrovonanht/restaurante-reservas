import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET IN `api/v1/migrations`", () => {
  describe("With anonymous user", () => {
    test("With no session", async () => {
      const request = await fetch("http://localhost:3000/api/v1/migrations");
      expect(request.status).toBe(401);

      const responseBody = await request.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Sessão inválida.",
        action: "Verifique se o usuário está logado.",
        status_code: 401,
      });
    });
  });
  describe("With Default User", () => {
    test("Without feature read:migrations", async () => {
      const createdUser = await orchestrator.createUser();
      const createdSession = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não pode executar esta operação.",
        action: `Verifique se este usuário possui a feature "read:migrations".`,
        status_code: 403,
      });
    });
  });
  describe("With Privileged User", () => {
    test("Retrieving pending migrations", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.promoteUserToAdmin(createdUser.id);
      const createdSession = await orchestrator.createSession(createdUser.id);
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual([]);
    });
  });
});
