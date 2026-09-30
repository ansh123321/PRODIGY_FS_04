const mongoose = require("mongoose");

const roomMessageSchema = new mongoose.Schema(
    {
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("RoomMessage", roomMessageSchema);