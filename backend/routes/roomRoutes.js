const express = require("express");

const Room = require("../models/Room");
const RoomMessage = require("../models/RoomMessage");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// GET ALL ROOMS
router.get("/", authMiddleware, async (req, res) => {
    try {
        const rooms = await Room.find()
            .sort({ name: 1 })
            .populate("createdBy", "username");

        res.json({
            rooms
        });

    } catch (error) {
        console.error("Room list error:", error);

        res.status(500).json({
            message: "Unable to load rooms"
        });
    }
});


// GET ROOM MESSAGES
router.get("/:roomId/messages", authMiddleware, async (req, res) => {
    try {
        const messages = await RoomMessage.find({
            room: req.params.roomId
        })
            .sort({ createdAt: 1 })
            .populate("sender", "username");

        res.json({
            messages
        });

    } catch (error) {
        console.error("Room message history error:", error);

        res.status(500).json({
            message: "Unable to load room messages"
        });
    }
});


// CREATE ROOM
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Room name is required"
            });
        }

        const roomName = name.trim();

        if (roomName.length > 50) {
            return res.status(400).json({
                message: "Room name cannot exceed 50 characters"
            });
        }

        const existingRoom = await Room.findOne({
            name: roomName
        });

        if (existingRoom) {
            return res.status(409).json({
                message: "Room already exists"
            });
        }

        const room = await Room.create({
            name: roomName,
            description: description
                ? description.trim()
                : "",
            createdBy: req.user.userId
        });

        await room.populate("createdBy", "username");

        res.status(201).json({
            room
        });

    } catch (error) {
        console.error("Room creation error:", error);

        res.status(500).json({
            message: "Unable to create room"
        });
    }
});


module.exports = router;