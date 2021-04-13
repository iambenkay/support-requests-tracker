import request from "supertest";

import "src/loader";

import server, { connection } from "src/server";

describe("Tickets", () => {
    it("should not create ticket because inaccurate data was provided", async () => {
        const authToken = await request(server)
            .post("/api/v1/login")
            .send({
                username: "kayode",
                pin: "0000"
            }).then(response => response.body.token);
        const ticketResponse = await request(server)
            .post("/api/v1/tickets")
            .send({
                subject: "Test Issue",
            })
            .set("Authorization", `Bearer ${authToken}`);

        expect(ticketResponse.status).toBe(400);
    })
    it("should create ticket because accurate data was provided", async () => {
        const authToken = await request(server)
            .post("/api/v1/login")
            .send({
                username: "kayode",
                pin: "0000"
            }).then(response => response.body.token);
        const ticketResponse = await request(server)
            .post("/api/v1/tickets")
            .send({
                subject: "Test Issue",
                body: "Test lorem ipsum issue",
            })
            .set("Authorization", `Bearer ${authToken}`);

        expect(ticketResponse.status).toBe(201);
    })
    it("should get tickets", async () => {
        const authToken = await request(server)
            .post("/api/v1/login")
            .send({
                username: "kayode",
                pin: "0000"
            }).then(response => response.body.token);
        const ticketResponse = await request(server)
            .get("/api/v1/tickets")
            .set("Authorization", `Bearer ${authToken}`);

        expect(ticketResponse.status).toBe(200);
    })
    it("should get ticket by id", async () => {
        const authToken = await request(server)
            .post("/api/v1/login")
            .send({
                username: "kayode",
                pin: "0000"
            }).then(response => response.body.token);
        const ticketResponse = await request(server)
            .post("/api/v1/tickets")
            .send({
                subject: "Test Issue",
                body: "Test lorem ipsum issue",
            })
            .set("Authorization", `Bearer ${authToken}`);
        const getTicketResponse = await request(server)
            .get(`/api/v1/tickets/${ticketResponse.body.data.ticketId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(getTicketResponse.status).toBe(200);
    })
    it("should not reply to ticket because is CUSTOMER and has not been addressed by SUPPORT_AGENT", async () => {
        const authToken = await request(server)
            .post("/api/v1/login")
            .send({
                username: "kayode",
                pin: "0000"
            }).then(response => response.body.token);

        const ticketResponse = await request(server)
            .post("/api/v1/tickets")
            .send({
                subject: "Test Issue",
                body: "Test lorem ipsum issue",
            })
            .set("Authorization", `Bearer ${authToken}`);

        const createReplyResponse = await request(server)
            .post(`/api/v1/tickets/${ticketResponse.body.data.ticketId}/replies`)
            .send({
                body: "First Reply"
            })
            .set("Authorization", `Bearer ${authToken}`);

        expect(createReplyResponse.status).toBe(400);
    })
    it("should reply to ticket because is SUPPORT_AGENT", async () => {
        const authToken = await request(server)
            .post("/api/v1/login")
            .send({
                username: "benjamin",
                pin: "0000"
            }).then(response => response.body.token);

        const customerAuthToken = await request(server)
            .post("/api/v1/login")
            .send({
                username: "kayode",
                pin: "0000"
            }).then(response => response.body.token);

        const ticketResponse = await request(server)
            .post("/api/v1/tickets")
            .send({
                subject: "Test Issue",
                body: "Test lorem ipsum issue",
            })
            .set("Authorization", `Bearer ${customerAuthToken}`);

        const createReplyResponse = await request(server)
            .post(`/api/v1/tickets/${ticketResponse.body.data.ticketId}/replies`)
            .send({
                body: "What's the problem in clearer terms?"
            })
            .set("Authorization", `Bearer ${authToken}`);

        expect(createReplyResponse.status).toBe(201);
    })
    it("should reply to ticket because is CUSTOMER and ticket has been replied to then resolve it.", async () => {
        const authToken = await request(server)
            .post("/api/v1/login")
            .send({
                username: "benjamin",
                pin: "0000"
            }).then(response => response.body.token);

        const customerAuthToken = await request(server)
            .post("/api/v1/login")
            .send({
                username: "kayode",
                pin: "0000"
            }).then(response => response.body.token);

        const ticketResponse = await request(server)
            .post("/api/v1/tickets")
            .send({
                subject: "Test Issue",
                body: "Test lorem ipsum issue",
            })
            .set("Authorization", `Bearer ${customerAuthToken}`);

        const createReplyResponse = await request(server)
            .post(`/api/v1/tickets/${ticketResponse.body.data.ticketId}/replies`)
            .send({
                body: "What's the problem in clearer terms?"
            })
            .set("Authorization", `Bearer ${authToken}`);

        expect(createReplyResponse.status).toBe(201);

        const createCustomerReplyResponse = await request(server)
            .post(`/api/v1/tickets/${ticketResponse.body.data.ticketId}/replies`)
            .send({
                body: "I have a very cryptic issue"
            })
            .set("Authorization", `Bearer ${customerAuthToken}`);

        expect(createCustomerReplyResponse.status).toBe(201);

        const resolveTicketResponse = await request(server)
            .put(`/api/v1/tickets/${ticketResponse.body.data.ticketId}`)
            .send({
                status: "RESOLVED",
            })
            .set("Authorization", `Bearer ${authToken}`)

        expect(resolveTicketResponse.status).toBe(200)
    })

})

afterAll(async (done) => {
    connection.close();
    done();
});