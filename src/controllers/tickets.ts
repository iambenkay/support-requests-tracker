import Ticket from "src/models/ticket";
import Reply from "src/models/reply";
import { Authorized } from "src/@decorators/authorized.decorator";
import { GET, POST, PUT } from "src/@decorators/http.decorator";
import { Response, ResponseError } from "src/controllers";
import { AuthRole, ControllerData, SortDirection, TicketStatus } from "src/@types"
import { Paginated } from "src/@decorators/utils.decorator";
import * as csv from "src/utils/csv-parser";
import * as date from "src/utils/date";

export default class {
    @Authorized(AuthRole.CUSTOMER)
    @POST("api/v1/tickets")
    async createTicket({ body, claims }: ControllerData): Promise<Response> {
        const ticketId = await Ticket.findLastTicketId();
        const ticket = new Ticket({
            subject: body.subject,
            body: body.body,
            ticketId: ticketId + 1,
            author: claims.id,
        })
        await ticket.save().catch(e => {
            throw new ResponseError(400, e.message);
        });
        return new Response(201, {
            error: false,
            message: "Ticket was created successfully",
            data: ticket.toJSON()
        })
    }

    @Paginated({
        page: 1,
        limit: 20,
        sort: "ticketId",
        direction: SortDirection.ASC
    })
    @Authorized()
    @GET("api/v1/tickets")
    async getTickets({ claims, page }: ControllerData) {
        let query = null;
        switch (claims.role) {
            case AuthRole.ADMIN:
            case AuthRole.SUPPORT_AGENT:
                query = Ticket.find({}, '', {
                    sort: { [page.sort]: page.direction },
                    skip: (page.page - 1) * page.limit,
                    limit: page.limit
                });
                break;
            case AuthRole.CUSTOMER:
                query = Ticket.find({ author: claims.id }, '', {
                    sort: { [page.sort]: page.direction },
                    skip: (page.page - 1) * page.limit,
                    limit: page.limit
                });
                break;
        }

        const tickets = await query;
        return new Response(200, {
            error: false,
            message: "Tickets retrieved successfully",
            data: tickets,
        })
    }

    @Paginated({
        page: 1,
        limit: 20,
        sort: "resolvedAt",
        direction: SortDirection.ASC
    })
    @Authorized(AuthRole.SUPPORT_AGENT)
    @GET("api/v1/tickets/resolved-report")
    async getResolvedTicketsReport({ claims, page }: ControllerData) {
        const oneMonthAgo = date.addMonth(new Date(), -1)
        const tickets = await Ticket.find({ status: TicketStatus.RESOLVED, resolvedAt: { $gt: oneMonthAgo } }, '', {
            sort: { [page.sort]: page.direction },
            skip: (page.page - 1) * page.limit,
            limit: page.limit
        });
        const report = csv.parse(tickets, { fields: ["ticketId", "subject", "body", "status", "resolvedAt", "createdAt"] })
        return new Response(200, report)
    }

    @Authorized(AuthRole.CUSTOMER)
    @PUT("api/v1/tickets/:id")
    async updateTicket({ body, params, claims }: ControllerData) {
        let update = {};
        if (body.status === TicketStatus.RESOLVED) {
            update = { ...update, resolvedAt: new Date(), status: TicketStatus.RESOLVED }
        }
        await Ticket.findOneAndUpdate({ ticketId: params.id, author: claims.id }, update);
        return new Response(200, {
            error: false,
            message: "Ticket updated successfully",
            data: null,
        })
    }

    @Authorized()
    @GET("api/v1/tickets/:id")
    async getTicket({ claims, params }: ControllerData) {
        let query = null;
        switch (claims.role) {
            case AuthRole.ADMIN:
            case AuthRole.SUPPORT_AGENT:
                query = Ticket.findByTicketId(params.id);
                break;
            case AuthRole.CUSTOMER:
                query = Ticket.findOne({ ticketId: params.id, author: claims.id });
                break;
        }

        const tickets = await query;
        return new Response(200, {
            error: false,
            message: "Ticket retrieved successfully",
            data: tickets,
        })
    }

    @Paginated({
        page: 1,
        limit: 20,
        sort: "createdAt",
        direction: SortDirection.DESC
    })
    @Authorized()
    @GET("api/v1/tickets/:id/replies")
    async getTicketReplies({ claims, params }: ControllerData) {
        let query = null;
        let ticket = null;

        switch (claims.role) {
            case AuthRole.ADMIN:
            case AuthRole.SUPPORT_AGENT:
                ticket = await Ticket.findByTicketId(params.id);
                query = Reply.find({ ticketId: ticket._id });
                break;
            case AuthRole.CUSTOMER:
                ticket = await Ticket.findOne({ ticketId: params.id, author: claims.id });
                query = ticket.author.toString() === claims.id
                    ? Reply.find({ ticketId: ticket._id })
                    : Promise.all([]);
                break;
        }

        const replies = await query;
        return new Response(200, {
            error: false,
            message: "Replies retrieved successfully",
            data: replies,
        });
    }

    @Authorized(AuthRole.CUSTOMER, AuthRole.SUPPORT_AGENT)
    @POST("api/v1/tickets/:id/replies")
    async createTicketReply({ body, claims, params }: ControllerData): Promise<Response> {
        const ticket = await Ticket.findByTicketId(params.id);
        if (claims.role === AuthRole.CUSTOMER && ticket.status === TicketStatus.UNATTENDED) {
            throw new ResponseError(400, "ticket has not been replied by support agent");
        }
        const reply = new Reply({
            body: body.body,
            author: claims.id,
            ticketId: ticket._id
        });
        await reply.save().catch(e => {
            throw new ResponseError(400, e.message);
        });
        ticket.status = TicketStatus.REPLIED;
        await ticket.save().catch(e => {
            throw new ResponseError(400, e.message);
        });
        return new Response(201, {
            error: false,
            message: "Reply was created successfully",
            data: reply.toJSON()
        });
    }
}