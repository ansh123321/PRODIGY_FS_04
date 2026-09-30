const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 50
        },

        description: {
            type: String,
            default: "",
            maxlength: 200
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Room", roomSchema);