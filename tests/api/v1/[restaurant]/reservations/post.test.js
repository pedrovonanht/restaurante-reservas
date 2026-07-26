import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";


beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST in `api/v1/restaurants`", () => {
  describe("Anonymous User", () => {
    test("With avaliable table", async () => {
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

      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 4,
        maxCapacity: 6
      })
      
      // fetching as anonymous
      const response = await fetch("http:localhost:3000/api/v1/validrestaurant/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-08-20",
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
          event_id: createdEvent.id,
          restaurant_id: createdRestaurant.id,
          party_size: 5,
          guest_name: "Carlos",
          guest_phone: "53991841962",
          reservation_time: "19:30",
          public_token: responseBody.public_token,
          created_at: responseBody.created_at,
          updated_at: responseBody.updated_at,
      })
         
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.public_token.length).toBe(43)

      // fetch (http:localhost:3000/api/v1/valid-restaurant/${responseBody.public_token})
    });
    test("With no avaliable table fit", async () => {
      const createdUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "NoCapability",
        max_covers: "5",
      });

      await orchestrator.createEvent(createdRestaurant.id, {
        event_date: "2026-08-20",
        event_times: ["19:30", "20:30", "21:30"],
        name: "Same Event",
      })

      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 5,
        maxCapacity: 6
      })

      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 02",
        minCapacity: 2,
        maxCapacity: 3
      })
      // fetching as anonymous
      const response = await fetch("http:localhost:3000/api/v1/nocapability/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-08-20",
          reservation_time: "19:30",
          party_size: "4",
          guest_name: "Carlos",
          guest_phone: "53991841962"
        })
      });

      expect(response.status).toBe(422)
      const responseBody = await response.json();

      expect(responseBody).toEqual({
         name: "BusinessRuleError", 
         message: "Não há mesa disponivel para 4 pessoas",
         action: "Tente outra data disponível.",
         status_code: 422
      })

       
    });
    test("With alredy taken tables", async () => {
      const createdUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "AlredyTakenTable",
        max_covers: "5",
      });

      await orchestrator.createEvent(createdRestaurant.id, {
        event_date: "2026-08-20",
        event_times: ["19:30", "20:30", "21:30"],
        name: "Same Event",
      })

      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 5,
        maxCapacity: 6
      })

      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 02",
        minCapacity: 2,
        maxCapacity: 3
      })
      // fetching as anonymous
      const response = await fetch("http:localhost:3000/api/v1/alredytakentable/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-08-20",
          reservation_time: "19:30",
          party_size: "2",
          guest_name: "Carlos",
          guest_phone: "53991841962"
        })
      });

      expect(response.status).toBe(201);


      const response2 = await fetch("http:localhost:3000/api/v1/nocapability/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-08-20",
          reservation_time: "19:30",
          party_size: "2",
          guest_name: "Gomez",
          guest_phone: "53991841972"
        })
      });

      expect(response2.status).toBe(422)
      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
         name: "BusinessRuleError", 
         message: "O limite de reservas foi atingido para essa data.",
         action: "Tente outra data disponível.",
         status_code: 422
      })
    });
    test("With no avaliable table for this event", async () => {
      const createdUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "NoAvaliableFit",
        max_covers: "5",
      });

      await orchestrator.createEvent(createdRestaurant.id, {
        event_date: "2026-08-20",
        event_times: ["19:30", "20:30", "21:30"],
        name: "Same Event",
      })

      const createdEvent = await orchestrator.createEvent(createdRestaurant.id, {
        event_date: "2026-09-21",
        event_times: ["19:30", "20:30", "21:30"],
        name: "Other event",
      })

      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 02",
        minCapacity: 2,
        maxCapacity: 4
      })
      // fetching as anonymous
      const response = await fetch("http:localhost:3000/api/v1/noavaliablefit/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-08-20",
          reservation_time: "19:30",
          party_size: "2",
          guest_name: "Carlos",
          guest_phone: "53991841962"
        })
      });

      expect(response.status).toBe(201);


      const response2 = await fetch("http:localhost:3000/api/v1/nocapability/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-09-21",
          reservation_time: "19:30",
          party_size: "2",
          guest_name: "Gomez",
          guest_phone: "53991841972"
        })
      });

      expect(response2.status).toBe(201)
      const responseBody2 = await response2.json();

       expect(responseBody2).toEqual({
          id: responseBody2.id,
          event_id: createdEvent.id,
          restaurant_id: createdRestaurant.id,
          party_size: 5,
          guest_name: "Carlos",
          guest_phone: "53991841962",
          reservation_time: "19:30",
          public_token: responseBody2.public_token,
          created_at: responseBody2.created_at,
          updated_at: responseBody2.updated_at,
      })
         
      expect(uuidVersion(responseBody2.id)).toBe(4);
      expect(Date.parse(responseBody2.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody2.updated_at)).not.toBeNaN();

      expect(responseBody2.public_token.length).toBe(43)
    });
    test("With 3 table avaliable for this event", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id)
      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "Bestfit",
        max_covers: "50",
      });


      await orchestrator.createEvent(createdRestaurant.id, {
        event_date: "2026-08-20",
        event_times: ["19:30", "20:30", "21:30"],
        name: "Best Fit event",
      })


      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 01",
        minCapacity: 2,
        maxCapacity: 4
      })

      await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 02",
        minCapacity: 2,
        maxCapacity: 4
      })

       await orchestrator.createTable({
        restaurantId: createdRestaurant.id,
        name: "mesa 03",
        minCapacity: 4,
        maxCapacity: 6
      })
      // fetching as anonymous
      const response = await fetch("http:localhost:3000/api/v1/bestfit/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-08-20",
          reservation_time: "19:30",
          party_size: "4",
          guest_name: "Carlos",
          guest_phone: "53991841962"
        })
      });
      
      expect(response.status).toBe(201);
      

      // table chosen assertions
      const response2 = await fetch(
        `http://localhost:3000/api/v1/restaurants/${createdRestaurant.slug}/reservations?from=2026-08-20&to=2026-08-20`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response2.status).toBe(200);
      const response2Body = await response2.json();
      expect(response2Body[0].table_name).toBe("mesa 03");
    });
    test("With duplicated booking for the same event", async () => {
      const createdUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "duplicatedBooking",
        max_covers: "20",
      });

      const createdEvent =  await orchestrator.createEvent(createdRestaurant.id, {
        event_date: "2026-08-20",
        event_times: ["19:30", "20:30", "21:30"],
        name: "Same Event",
      })

      // fetching as anonymous
      const response = await fetch("http:localhost:3000/api/v1/duplicatedbooking/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-08-20",
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
          event_id: createdEvent.id,
          restaurant_id: createdRestaurant.id,
          party_size: 15,
          reservation_time: "19:30",
          guest_name: "Carlos",
          guest_phone: "53991841962",
          public_token: responseBody.public_token,
          created_at: responseBody.created_at,
          updated_at: responseBody.updated_at,
      })
         
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.public_token.length).toBe(43)

      const response2 = await fetch("http:localhost:3000/api/v1/duplicatedbooking/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-08-20",
          reservation_time: "19:30",
          party_size: "15",
          guest_name: "Carlos alvarez",
          guest_phone: "53991841962" //primary identifier is the phone number
        })
      });
      expect(response2.status).toBe(409)

      const responseBody2 = await response2.json();
         expect(responseBody2).toEqual({
         name: "BusinessRuleError",  //pensar se esse é o melhor nome
         message: "O limite de reservas foi atingido para essa data.",
         action: "Tente outra data disponível.",
         status_code: 409
      })
    });
    test("With no valid `reservation_time` field", async () => {
      const createdUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "NoReservationTime",
        max_covers: "5",
      });

      await orchestrator.createEvent(createdRestaurant.id, {
        event_date: "2026-08-20",
        event_times: ["19:30", "20:30", "21:30"],
        name: "Same Event",
      })
      // fetching as anonymous
      const response = await fetch("http:localhost:3000/api/v1/noreservationtime/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-08-20",
          reservation_time: "27:24",
          party_size: "2",
          guest_name: "Carlos",
          guest_phone: "53991841962"
        })
      });

      expect(response.status).toBe(400)
      const responseBody2 = await response.json();

      expect(responseBody2).toEqual({
         name: "ValidationError", 
         message: "O campo `reservation_time` é obrigatorio para reservas.",
         action: "Adicione esse campo e tente novamente.",
         status_code: 400
      })
    });
    test("With no existing event", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.createRestaurant(createdUser.id, {
        name: "noExisting",
        max_covers: "20",
      });


      // fetching as anonymous
      const response = await fetch("http:localhost:3000/api/v1/noexisting/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: "2026-07-19",
          reservation_time: "19:30",
          party_size: "15",
          guest_name: "Carlos",
          guest_phone: "53991841962"
        })
      });

      expect(response.status).toBe(404)
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",  
        message: "Não foi encontrado um evento para essa data.",
          action: "Verifique a data e tente novamente",
          status_code: 404
      })
         
    });
    test("After event date", async () => {
      const createdUser = await orchestrator.createUser();
      const createdRestaurant = await orchestrator.createRestaurant(createdUser.id, {
        name: "after",
        max_covers: "20",
      });

      const dateOneMonthBehind = new Date();
    dateOneMonthBehind.setMonth(dateOneMonthBehind.getMonth() - 1);
    const formatedDate = dateOneMonthBehind.toISOString().slice(0, 10);

     await orchestrator.createEvent(createdRestaurant.id, {
        event_date: formatedDate,
        event_times: ["19:30", "20:30", "21:30"],
        name: "Same Event",
      })
      // fetching as anonymous
      const response = await fetch("http:localhost:3000/api/v1/after/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reservation_date: formatedDate,
          reservation_time: "19:30",
          party_size: "15",
          guest_name: "Carlos",
          guest_phone: "53991841962"
        })
      });
      expect(response.status).toBe(422)
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",  
        message: "A `reservation_date` não pode estar no passado.",
          action: "Verifique a data e tente novamente.",
          status_code: 422
      })
         
    });
    });
  });
