const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const RoomMessage = require("../models/RoomMessage");
const User = require("../models/User");

const onlineUsers = new Map();

function setupChatSocket(io) {
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("authenticate", async (token) => {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                socket.userId = decoded.userId;

                onlineUsers.set(decoded.userId, socket.id);

                await User.findByIdAndUpdate(decoded.userId, {
                    isOnline: true
                });

                socket.emit("authenticated", {
                    userId: decoded.userId
                });

                io.emit("userStatus", {
                    userId: decoded.userId,
                    online: true
                });

            } catch (error) {
                socket.emit("authError", {
                    message: "Invalid token"
                });
            }
        });


        // PRIVATE MESSAGE
        socket.on("privateMessage", async ({ receiverId, content }) => {
            try {
                if (!socket.userId) {
                    return socket.emit("messageError", {
                        message: "Not authenticated"
                    });
                }

                if (!content || !content.trim()) return;

                if (content.trim().length > 2000) {
                    return socket.emit("messageError", {
                        message: "Message cannot exceed 2000 characters"
                    });
                }

                const message = await Message.create({
                    sender: socket.userId,
                    receiver: receiverId,
                    content: content.trim()
                });

                const messageData = {
                    id: message._id,
                    sender: socket.userId,
                    receiver: receiverId,
                    content: message.content,
                    createdAt: message.createdAt
                };

                socket.emit("newMessage", messageData);

                const receiverSocket = onlineUsers.get(receiverId);

                if (receiverSocket) {
                    io.to(receiverSocket).emit(
                        "newMessage",
                        messageData
                    );
                }

            } catch (error) {
                console.error("Private message error:", error);

                socket.emit("messageError", {
                    message: "Unable to send message"
                });
            }
        });


        // JOIN ROOM
        socket.on("joinRoom", (roomId) => {
            if (!socket.userId) return;

            if (socket.currentRoom) {
                socket.leave(socket.currentRoom);
            }

            socket.join(roomId);
            socket.currentRoom = roomId;

            socket.emit("roomJoined", {
                roomId
            });
        });


        // LEAVE ROOM
        socket.on("leaveRoom", (roomId) => {
            socket.leave(roomId);

            if (socket.currentRoom === roomId) {
                socket.currentRoom = null;
            }
        });


        // ROOM MESSAGE
        socket.on("roomMessage", async ({ roomId, content }) => {
            try {
                if (!socket.userId) {
                    return socket.emit("messageError", {
                        message: "Not authenticated"
                    });
                }

                if (!content || !content.trim()) return;

                if (content.trim().length > 2000) {
                    return socket.emit("messageError", {
                        message: "Message cannot exceed 2000 characters"
                    });
                }

                const message = await RoomMessage.create({
                    room: roomId,
                    sender: socket.userId,
                    content: content.trim()
                });

                const messageData = {
                    id: message._id,
                    room: roomId,
                    sender: socket.userId,
                    content: message.content,
                    createdAt: message.createdAt
                };

                io.to(roomId).emit(
                    "newRoomMessage",
                    messageData
                );

            } catch (error) {
                console.error("Room message error:", error);

                socket.emit("messageError", {
                    message: "Unable to send room message"
                });
            }
        });


        // DISCONNECT
        socket.on("disconnect", async () => {
            if (socket.userId) {
                const currentSocket =
                    onlineUsers.get(socket.userId);

                if (currentSocket === socket.id) {
                    onlineUsers.delete(socket.userId);

                    await User.findByIdAndUpdate(
                        socket.userId,
                        {
                            isOnline: false
                        }
                    );

                    io.emit("userStatus", {
                        userId: socket.userId,
                        online: false
                    });
                }
            }

            console.log("Socket disconnected:", socket.id);
        });
    });
}

module.exports = setupChatSocket;