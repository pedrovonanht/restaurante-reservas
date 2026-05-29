import orchestrator from "tests/orchestrator";

beforeAll(() => {
  orchestrator.clearDatabase();
});

test("GET `api/v1/status`", async () => {
  const request = await fetch("http://localhost:3000/api/v1/status");
  expect(request.status).toBe(200);

  const requestBody = await request.json();
  const parsedUpdatedAt = new Date(requestBody.updated_at).toISOString();
  expect(requestBody.version).toBe("18.4");
  expect(requestBody.max_conections).toBe(100);
  expect(requestBody.used_conections).toBe(1);
  expect(parsedUpdatedAt).toBe(requestBody.updated_at);
});
