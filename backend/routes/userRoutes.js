const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const users = await User.find(
            { _id: { $ne: req.user.userId } },
            "username email isOnline"
        ).sort({ username: 1 });

        res.json({ users });
    } catch (error) {
        console.error("Users error:", error);

        res.status(500).json({
            message: "Unable to load users"
        });
    }
});

module.exports = router;