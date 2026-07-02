import password from "models/password.js";
import user from "models/user.js";
import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST in `api/v1/user`", () => {
  describe("Anonymouse user", () => {
    test("With valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "validUsername",
          password: "validPassword",
          email: "validEmail@gmail.com",
        }),
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "validUsername",
        email: "validEmail@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("validUsername");
      const correctPasswordMatch = await password.compare(
        "validPassword",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "invalidPassword",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true)
      expect(incorrectPasswordMatch).toBe(false)
    });

    test("With duplicated username", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usedusername",
          password: "firstpassword",
          email: "usedUsername@gmail.com",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Usedusername",
          password: "firstpassword2",
          email: "uneusedUsername2@gmail.com",
        }),
      });
      expect(response2.status).toBe(400);

      const requestBody = await response2.json();
      expect(requestBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar essa operação!",
        status_code: 400,
      });
    });
    test("With duplicated email", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado",
          password: "emailduplicado123",
          email: "emailduplicado@gmail.com",
        }),
      });
      expect(response1.status).toBe(201);
      const response2 = await fetch("http://localhost:3000/api/v1/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          password: "Emailduplicado1233",
          email: "emailduplicado@gmail.com",
        }),
      });
      expect(response2.status).toBe(400);

      const requestBody = await response2.json();
      expect(requestBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar essa operação!",
        status_code: 400,
      });
    });
    test("With undefined password", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "senhaIndefinida",
          email: "senhaindefinida@gmail.com",
        }),
      });

      expect(response1.status).toBe(400);

      const requestBody = await response1.json();
      expect(requestBody).toEqual({
        name: "ValidationError",
        message: "O campo `password` é obrigatório.",
        action: "Tente novamente informando uma `password`",
        status_code: 400,
      });
    });
  });
});
