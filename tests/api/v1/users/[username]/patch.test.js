import password from "models/password.js";
import user from "models/user.js";
import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH in `api/v1/users/[username]`", () => {
  describe("Anonymous user", () => {
    test("With no session", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/anyUsername",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "notExist",
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
    test("With nonexistent username", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/NotExists",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "notExist",
          }),
        },
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique o username informado.",
        status_code: 404,
      });
    });

    test("Updating another user", async () => {
      const createdUser = await orchestrator.createUser();
      const targetUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${targetUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "hijacked",
          }),
        },
      );
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não pode executar esta operação.",
        action: "Você não possui permissão para atualizar outro usuário.",
        status_code: 403,
      });
    });

    test("With duplicated username", async () => {
      const createdUser1 = await orchestrator.createUser({
        username: "usedusername1",
        password: "firstpassword",
        email: "usedUsername@gmail.com",
      });
      await orchestrator.createUser({
        username: "usedusername2",
        password: "firstpassword",
        email: "usedUsername2@gmail.com",
      });
      const sessionObject = await orchestrator.createSession(createdUser1.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/usedusername1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "Usedusername2",
          }),
        },
      );
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar essa operação!",
        status_code: 400,
      });
    });
    test("With duplicated email", async () => {
      const createdUser1 = await orchestrator.createUser({
        username: "emailduplicado1",
        password: "emailduplicado123",
        email: "emailduplicado1@gmail.com",
      });
      await orchestrator.createUser({
        username: "emailduplicado2",
        password: "emailduplicado123",
        email: "emailduplicado2@gmail.com",
      });
      const sessionObject = await orchestrator.createSession(createdUser1.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/emailduplicado1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "Emailduplicado2@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar essa operação!",
        status_code: 400,
      });
    });
    test("With no object on request", async () => {
      const createdUser = await orchestrator.createUser({
        username: "noObject",
        password: "validPassword",
        email: "noObject@gmail.com",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/noObject",
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

    test("With unique username", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueUsername",
        password: "validPassword",
        email: "uniqueUsername@gmail.com",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUsername",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "uniqueUsername123",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUsername123",
        email: responseBody.email,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique email", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueEmail",
        password: "validEmail",
        email: "uniqueEmail@gmail.com",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "uniqueEmail123@gmail.com",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: "uniqueEmail123@gmail.com",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "newPassword",
        password: "validPassword",
        email: "newPassword@gmail.com",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/newPassword",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "newPassword123",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: responseBody.email,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("newPassword");
      const correctPasswordMatch = await password.compare(
        "newPassword123",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "invalidPassword",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With change in case of 'username'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "validChangeCase",
        password: "validPassword",
        email: "validChangeCase@gmail.com",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/validChangeCase",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "validchangecase",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "validchangecase",
        email: responseBody.email,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
});
