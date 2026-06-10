import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.waitForAllServices();
});

describe("GET IN `api/v1/migrations`", () => {
  describe("With anonymouse user", () => {
    test("Retrieving pending migrations", async () => {
      const request = await fetch("http://localhost:3000/api/v1/migrations");
      expect(request.status).toBe(200);

      const requestBody = await request.json();
      expect(Array.isArray(requestBody)).toBe(true);
      expect(requestBody.length).toBeGreaterThan(0);
    });
  });
});
