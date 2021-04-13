import mongoose from "mongoose";
import {TicketStatus} from "src/@types";

interface ITicket extends mongoose.Document {
    subject: string;
    body: string;
    ticketId: number;
    status: TicketStatus;
    author:string;
    resolvedAt: Date;
}

interface ITicketModel extends mongoose.Model<ITicket, ITicketModel> {
    findLastTicketId(): Promise<number>;
    findByTicketId(id: string): Promise<ITicket>;
}

const schema = new mongoose.Schema<ITicket>(
    {
        subject: {
            type: String,
            minlength: 1,
        },
        body: {
            type: String,
            required: "You must provide body",
            minlength: 1,
        },
        ticketId: {
            type: Number,
            required: "You must provide ticketId",
            unique: true,
        },
        author: {
            type: mongoose.Types.ObjectId,
            required: "you must provide author",
            index: true,
        },
        status: {
            type: TicketStatus,
            default: TicketStatus.UNATTENDED,
            required: "You must provide status",
            index: true,
        },
        resolvedAt: {
            type: Date,
            index: true,
        }
    },
    { timestamps: true }
);

schema.statics.findLastTicketId = function (): Promise<number> {
    return this.find().sort({ "ticketId": -1 }).limit(1).exec().then((tickets: any) => tickets[0] ? tickets[0].ticketId : 0);
};

schema.statics.findByTicketId = function (id: string): Promise<ITicket> {
    return this.findOne({ticketId: id});
};

export default mongoose.model<ITicket, ITicketModel>("Ticket", schema);
