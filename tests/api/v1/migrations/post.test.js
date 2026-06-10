import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.waitForAllServices();
});

describe("GET in `api/v1/migrations`", () => {
  describe("With anonymouse user", () => {
    test("For the first time", async () => {
      const request = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });
      expect(request.status).toBe(201);

      const requestBody = await request.json();
      expect(Array.isArray(requestBody)).toBe(true);
      expect(requestBody.length).toBeGreaterThan(0);
    });

    test("For the second time", async () => {
      const request = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST"
      });
      expect(request.status).toBe(200);

      const requestBody = await request.json();
      expect(Array.isArray(requestBody)).toBe(true);
      expect(requestBody.length).toBe(0);
    });
  });
});
