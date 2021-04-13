import mongoose from "mongoose";

interface IReply extends mongoose.Document {
    body: string;
    ticketId: number;
    author:string;
}

interface IReplyModel extends mongoose.Model<IReply, IReplyModel> {
    findByTicketId(id: string): Promise<IReply>;
    findByAuthor(id: string): Promise<IReply>;
}

const schema = new mongoose.Schema<IReply>(
    {
        body: {
            type: String,
            required: "You must provide body",
            minlength: 1,
        },
        ticketId: {
            type: mongoose.Types.ObjectId,
            required: "You must provide ticketId",
            index: true,
            ref: "Ticket"
        },
        author: {
            type: mongoose.Types.ObjectId,
            required: "you must provide author",
            index: true,
        },
    },
    { timestamps: true }
);

schema.statics.findByTicketId = function (id: string): Promise<IReply> {
    return this.findOne({ticketId: id});
};

schema.statics.findByAuthor = function (author: string): Promise<IReply> {
    return this.findOne({author});
};

export default mongoose.model<IReply, IReplyModel>("Reply", schema);
