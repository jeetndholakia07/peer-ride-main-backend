import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },
        messages: [
            {
                content: {
                    type: String,
                    required: true,
                },
                senderId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                isRead: {
                    type: Boolean,
                    default: false,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

MessageSchema.index({ chat: 1 });
MessageSchema.index({ "messages.isRead": 1 });
MessageSchema.index({ "messages.senderId": 1 });

const Message = mongoose.model("Message", MessageSchema);

export default Message;