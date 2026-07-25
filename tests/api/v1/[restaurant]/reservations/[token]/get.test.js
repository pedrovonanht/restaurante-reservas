import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";


beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET in `api/v1/[restaurant]/[token]`", () => {
  describe("Anonymous User", () => {
    test("With valid Token", async () => {
      const createdUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "validRestaurant",
        max_covers: "10",
      });
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        event_date: "2026-08-20",
        event_times: ["19:30", "20:30", "21:30"],
        name: "Same Event",
      })
      const createdReserve = await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        partySize: 2,
        guestName: "Piter",
        guestPhone: "54991831963",
        eventId: createdEvent.id,
        reservationTime: "19:30" 
      })
      // fetching as anonymous
      const response = await fetch(`http:localhost:3000/api/v1/validrestaurant/reservations/${createdReserve.public_token}`
      );

      expect(response.status).toBe(200)
      const responseBody = await response.json();

      expect(responseBody).toEqual({ //dont return all reserve information for security
          id: responseBody.id,
          party_size: createdReserve.party_size,
          guest_name: createdReserve.guest_name,
          reservation_time: createdReserve.reservation_time,
          created_at: responseBody.created_at,
          updated_at: responseBody.updated_at,
      })
         
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();


    });
    test("With invalid Token", async () => {
      const createdUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "invalidTokenRestaurant",
        max_covers: "10",
      });
      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        event_date: "2026-08-20",
        event_times: ["19:30", "20:30", "21:30"],
        name: "Same Event",
      })
      await orchestrator.createReserve({
        restaurantId: createdRestaurant.id,
        partySize: 2,
        guestName: "Piter",
        guestPhone: "54991831963",
        eventId: createdEvent.id, 
        reservationTime: "19:30"
      })
      // fetching as anonymous
      const response = await fetch(`http:localhost:3000/api/v1/invalidtokenrestaurant/reservations/invalidtoken`
      );

      expect(response.status).toBe(404)
      const responseBody = await response.json();

      
      expect(responseBody).toEqual({
        name: "NotFoundError",  
        message: "Reserva não encontrada no sistema.",
          action: "Verifique a url e tente novamente.",
          status_code: 404
      })


    });
    });
  });
