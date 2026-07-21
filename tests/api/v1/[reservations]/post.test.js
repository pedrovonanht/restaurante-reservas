import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import session from "models/session";
import membership from "models/membership.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST in `api/v1/restaurants`", () => {
  describe("Anonymous User", () => {
    test("Within avaliable slots", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(createdUser.id, {
        name: "validRestaurant",
        max_covers: "10",
      });

      // fetching as anonymous
      const response = await fetch("api/v1/valid-restaurant/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "19/07/2026",
          reservation_time: "19:30",
          party_size: "5",
          guest_name: "Carlos",
          guest_phone: "53991841962"
        })
      });

      expect(response.status).toBe(201)
      const responseBody = await response.json();

      expect(responseBody).toEqual({
          id: responseBody.id,
          reservation_date: "19/07/2026",
          reservation_time: "19:30",
          party_size: "5",
          guest_name: "Carlos",
          guest_phone: "53991841962",
          public_token: responseBody.public_token,
          created_at: responseBody.created_at,
          updated_at: responseBody.updated_at,
      })
         
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.public_token).toHaveLenght(43)

      // fetch (api/v1/valid-restaurant/${responseBody.public_token})
    });
    test("With no avaliable slots", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(createdUser.id, {
        name: "NoCapability",
        max_covers: "5",
      });

      // fetching as anonymous
      const response = await fetch("api/v1/valid-restaurant/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "19/07/2026",
          reservation_time: "19:30",
          party_size: "5",
          guest_name: "Carlos",
          guest_phone: "53991841962"
        })
      });

      expect(response.status).toBe(201)

       const response2 = await fetch("api/v1/valid-restaurant/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "19/07/2026",
          reservation_time: "19:30",
          party_size: "5",
          guest_name: "Gomez",
          guest_phone: "53991841972"
        })
      });

      expect(response2.status).toBe(422)
      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
         name: "OverCapacityError", 
         message: "O limite de reservas foi atingido para essa data.",
         action: "Tente outra data disponível.",
         status_code: 422
      })
    });
    test("With duplicated booking for the same day", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(createdUser.id, {
        name: "validRestaurant",
        max_covers: "20",
      });

      // fetching as anonymous
      const response = await fetch("api/v1/valid-restaurant/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "19/07/2026",
          reservation_time: "19:30",
          party_size: "15",
          guest_name: "Carlos",
          guest_phone: "53991841962"
        })
      });

      expect(response.status).toBe(201)
      const responseBody = await response.json();

      expect(responseBody).toEqual({
          id: responseBody.id,
          reservation_date: "19/07/2026",
          reservation_time: "19:30",
          party_size: "5",
          guest_name: "Carlos",
          guest_phone: "53991841962",
          public_token: responseBody.public_token,
          created_at: responseBody.created_at,
          updated_at: responseBody.updated_at,
      })
         
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.public_token).toHaveLenght(43)

      const response2 = await fetch("api/v1/valid-restaurant/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "19/07/2026",
          reservation_time: "19:30",
          party_size: "15",
          guest_name: "Carlos alvarez",
          guest_phone: "53991841962" //primary identifier is the phone number
        })
      });
      expect(response2.status).toBe(400)

      const responseBody2 = await response2.json();
         expect(response2Body).toEqual({
         name: "OverCapacityError", 
         message: "O limite de reservas foi atingido para essa data.",
         action: "Tente outra data disponível.",
         status_code: 422
      })
    });
    });
  });
});
