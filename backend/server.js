const dns = require("dns");

dns.setServers(["8.8.8.8"]);
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const Room = require("./models/Room");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const setupChatSocket = require("./sockets/chatSocket");
const roomRoutes = require("./routes/roomRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Real-Time Chat API is running" });
});

setupChatSocket(io);

async function seedRooms() {
    const existingRooms = await Room.countDocuments();

    if (existingRooms > 0) return;

    const firstUser = await require("./models/User").findOne();

    if (!firstUser) return;

    await Room.insertMany([
        {
            name: "General",
            description: "General discussion",
            createdBy: firstUser._id
        },
        {
            name: "Technology",
            description: "Programming and technology",
            createdBy: firstUser._id
        },
        {
            name: "Random",
            description: "Anything goes",
            createdBy: firstUser._id
        }
    ]);

    console.log("Default chat rooms created");
}

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB connected");

        await seedRooms();

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });