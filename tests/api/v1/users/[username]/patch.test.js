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
    test("With nonexistent username", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users/NotExists", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "notExist",
        }),
      });
      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique o username informado.",
        status_code: 404,
      });
    });
    
    test("With duplicated username", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usedusername1",
          password: "firstpassword",
          email: "usedUsername@gmail.com",
        }),
      });
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usedusername2",
          password: "firstpassword",
          email: "usedUsername2@gmail.com",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/usedusername1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Usedusername2",
        }),
      });
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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          password: "emailduplicado123",
          email: "emailduplicado1@gmail.com",
        }),
      });
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          password: "emailduplicado123",
          email: "emailduplicado2@gmail.com",
        }),
      });
      const response = await fetch("http://localhost:3000/api/v1/users/emailduplicado1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "Emailduplicado2@gmail.com",
        }),
      });

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
        await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "noObject",
          password: "validPassword",
          email: "noObject@gmail.com",
        }),
      });
        const response = await fetch("http://localhost:3000/api/v1/users/noObject", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUsername",
          password: "validPassword",
          email: "uniqueUsername@gmail.com",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/uniqueUsername", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUsername123"
        }),
      });
      expect(response.status).toBe(200)

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUsername123",
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

    });
   
    test("With unique email", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueEmail",
          password: "validEmail",
          email: "uniqueEmail@gmail.com",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/uniqueEmail", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "uniqueEmail123@gmail.com"
        }),
      });
      expect(response.status).toBe(200)

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: "uniqueEmail123@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

    });
    test("With new 'password'", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPassword",
          password: "validPassword",
          email: "newPassword@gmail.com",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/newPassword", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "newPassword123",
        }),
      });
      expect(response.status).toBe(200)

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: responseBody.email,
        password: responseBody.password,
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

      expect(correctPasswordMatch).toBe(true)
      expect(incorrectPasswordMatch).toBe(false)
    });

    test("With change in case of 'username'", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "validChangeCase",
          password: "validPassword",
          email: "validChangeCase@gmail.com",
        }),
      });

      const response = await fetch("http://localhost:3000/api/v1/users/validChangeCase", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "validchangecase"
        }),
      });
      expect(response.status).toBe(200)

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "validchangecase",
        email: responseBody.email,
        password: responseBody.password,
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
