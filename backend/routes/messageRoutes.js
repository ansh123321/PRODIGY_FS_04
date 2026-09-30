const express = require("express");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get conversation with another user
router.get("/:userId", authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                {
                    sender: req.user.userId,
                    receiver: req.params.userId
                },
                {
                    sender: req.params.userId,
                    receiver: req.user.userId
                }
            ]
        })
            .sort({ createdAt: 1 })
            .populate("sender", "username")
            .populate("receiver", "username");

        res.json({
            messages
        });
    } catch (error) {
        console.error("Message history error:", error);

        res.status(500).json({
            message: "Unable to load messages"
        });
    }
});

module.exports = router;