const API_URL = "https://chatter-backend-09q6.onrender.com";

let socket = null;
let token = localStorage.getItem("token");
let currentUser = null;

let selectedUser = null;
let selectedRoom = null;

let isRegisterMode = false;


// ================================
// DOM ELEMENTS
// ================================

const authScreen = document.getElementById("authScreen");
const chatScreen = document.getElementById("chatScreen");

const authForm = document.getElementById("authForm");
const authButton = document.getElementById("authButton");
const authMessage = document.getElementById("authMessage");

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const userList = document.getElementById("userList");
const roomList = document.getElementById("roomList");

const chatUsername = document.getElementById("chatUsername");
const chatStatus = document.getElementById("chatStatus");

const messagesContainer = document.getElementById("messages");

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messageButton = messageForm.querySelector("button");

const logoutButton = document.getElementById("logoutButton");


// ================================
// SCREEN CONTROL
// ================================

function showChat() {
    authScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");
}


function showAuth() {
    chatScreen.classList.add("hidden");
    authScreen.classList.remove("hidden");
}


// ================================
// AUTH MESSAGE
// ================================

function setAuthMessage(message, success = false) {
    authMessage.textContent = message;

    authMessage.style.color = success
        ? "#22c55e"
        : "#f87171";
}


// ================================
// LOGIN / REGISTER TABS
// ================================

loginTab.addEventListener("click", () => {
    isRegisterMode = false;

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    usernameInput.hidden = true;
    usernameInput.required = false;

    authButton.textContent = "Login";

    setAuthMessage("");
});


registerTab.addEventListener("click", () => {
    isRegisterMode = true;

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    usernameInput.hidden = false;
    usernameInput.required = true;

    authButton.textContent = "Create account";

    setAuthMessage("");
});


// ================================
// AUTH FORM
// ================================

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    authButton.disabled = true;

    const endpoint = isRegisterMode
        ? "/api/auth/register"
        : "/api/auth/login";

    const body = {
        email: emailInput.value.trim(),
        password: passwordInput.value
    };

    if (isRegisterMode) {
        body.username = usernameInput.value.trim();
    }

    try {
        const response = await fetch(
            API_URL + endpoint,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setAuthMessage(
                data.message || "Request failed"
            );

            return;
        }


        // REGISTER
        if (isRegisterMode) {

            setAuthMessage(
                "Account created. You can now login.",
                true
            );

            loginTab.click();

            passwordInput.value = "";

            return;
        }


        // LOGIN
        token = data.token;
        currentUser = data.user;

        localStorage.setItem(
            "token",
            token
        );

        showChat();

        connectSocket();

        loadUsers();
        loadRooms();

    } catch (error) {

        console.error(error);

        setAuthMessage(
            "Unable to connect to server"
        );

    } finally {

        authButton.disabled = false;
    }
});


// ================================
// SOCKET CONNECTION
// ================================

function connectSocket() {

    socket = io(API_URL);


    // CONNECT
    socket.on("connect", () => {

        console.log(
            "Socket connected:",
            socket.id
        );

        socket.emit(
            "authenticate",
            token
        );
    });


    // AUTHENTICATED
    socket.on("authenticated", (data) => {

        console.log(
            "Socket authenticated:",
            data
        );
    });


    // AUTH ERROR
    socket.on("authError", (data) => {

        console.error(
            data.message
        );

        logout();
    });


    // MESSAGE ERROR
    socket.on("messageError", (data) => {

        console.error(
            "Message error:",
            data.message
        );

        alert(
            data.message ||
            "Unable to send message"
        );
    });


    // ================================
    // PRIVATE MESSAGE
    // ================================

    socket.on("newMessage", (message) => {

        if (!selectedUser) {
            return;
        }

        const senderId =
            typeof message.sender === "object"
                ? String(message.sender._id)
                : String(message.sender);

        const receiverId =
            typeof message.receiver === "object"
                ? String(message.receiver._id)
                : String(message.receiver);

        const selectedId =
            String(selectedUser._id);


        if (
            senderId === selectedId ||
            receiverId === selectedId
        ) {

            displayMessage(message);
        }
    });


    // ================================
    // ROOM MESSAGE
    // ================================

    socket.on(
        "newRoomMessage",
        (message) => {

            console.log(
                "ROOM MESSAGE RECEIVED:",
                message
            );


            if (!selectedRoom) {
                return;
            }


            const messageRoomId =
                typeof message.room === "object"
                    ? String(message.room._id)
                    : String(message.room);


            if (
                messageRoomId ===
                String(selectedRoom._id)
            ) {

                displayMessage(message);
            }
        }
    );


    // ================================
    // USER STATUS
    // ================================

    socket.on(
        "userStatus",
        (data) => {

            updateUserStatus(
                data.userId,
                data.online
            );
        }
    );


    // ================================
    // CONNECTION ERROR
    // ================================

    socket.on(
        "connect_error",
        (error) => {

            console.error(
                "Socket connection error:",
                error
            );
        }
    );
}


// ================================
// LOAD USERS
// ================================

async function loadUsers() {

    try {

        const response = await fetch(
            `${API_URL}/api/users`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        userList.innerHTML = "";


        data.users.forEach((user) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className = "user";

            button.dataset.userId =
                user._id;


            button.innerHTML = `
                <strong>
                    ${escapeHtml(user.username)}
                </strong>

                <div class="user-status ${
                    user.isOnline
                        ? "online"
                        : ""
                }">
                    ${
                        user.isOnline
                            ? "Online"
                            : "Offline"
                    }
                </div>
            `;


            button.addEventListener(
                "click",
                () => {

                    selectUser(user);
                }
            );


            userList.appendChild(button);
        });

    } catch (error) {

        console.error(
            "Users error:",
            error
        );
    }
}


// ================================
// SELECT PRIVATE USER
// ================================

async function selectUser(user) {

    selectedUser = user;

    // Important:
    // We are no longer inside a room.
    selectedRoom = null;


    // Remove room selection
    document
        .querySelectorAll(".room")
        .forEach((element) => {

            element.classList.remove(
                "selected",
                "active"
            );
        });


    // Select user
    document
        .querySelectorAll(".user")
        .forEach((element) => {

            element.classList.toggle(
                "selected",
                element.dataset.userId ===
                String(user._id)
            );
        });


    chatUsername.textContent =
        user.username;


    chatStatus.textContent =
        user.isOnline
            ? "Online"
            : "Offline";


    messageInput.disabled = false;

    messageButton.disabled = false;


    await loadMessages(
        user._id
    );
}


// ================================
// LOAD PRIVATE MESSAGES
// ================================

async function loadMessages(userId) {

    try {

        const response = await fetch(
            `${API_URL}/api/messages/${userId}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        messagesContainer.innerHTML =
            "";


        data.messages.forEach(
            (message) => {

                displayMessage(
                    message
                );
            }
        );


        scrollMessages();

    } catch (error) {

        console.error(
            "Message history error:",
            error
        );
    }
}


// ================================
// LOAD ROOMS
// ================================

async function loadRooms() {

    try {

        const response = await fetch(
            `${API_URL}/api/rooms`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        roomList.innerHTML = "";


        data.rooms.forEach((room) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className = "room";

            button.dataset.roomId =
                room._id;


            button.innerHTML = `
                <span class="room-hash">
                    #
                </span>

                <span>
                    ${escapeHtml(room.name)}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    selectRoom(room);
                }
            );


            roomList.appendChild(
                button
            );
        });

    } catch (error) {

        console.error(
            "Rooms error:",
            error
        );
    }
}


// ================================
// SELECT ROOM
// ================================

async function selectRoom(room) {

    selectedRoom = room;

    selectedUser = null;


    // Remove private-user selection
    document
        .querySelectorAll(".user")
        .forEach((element) => {

            element.classList.remove(
                "selected"
            );
        });


    // Select room
    document
        .querySelectorAll(".room")
        .forEach((element) => {

            const isSelected =
                element.dataset.roomId ===
                String(room._id);


            element.classList.toggle(
                "selected",
                isSelected
            );

            element.classList.toggle(
                "active",
                isSelected
            );
        });


    chatUsername.textContent =
        `# ${room.name}`;


    chatStatus.textContent =
        room.description ||
        "Chat room";


    messageInput.disabled = false;

    messageButton.disabled = false;


    messagesContainer.innerHTML =
        "";


    // Join socket room
    if (socket) {

        socket.emit(
            "joinRoom",
            room._id
        );
    }


    // Load room history
    try {

        const response = await fetch(
            `${API_URL}/api/rooms/${room._id}/messages`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        data.messages.forEach(
            (message) => {

                displayMessage(
                    message
                );
            }
        );


        scrollMessages();

    } catch (error) {

        console.error(
            "Room history error:",
            error
        );
    }
}


// ================================
// SEND MESSAGE
// ================================

messageForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const content =
            messageInput.value.trim();


        if (!content) {
            return;
        }


        if (content.length > 2000) {

            alert(
                "Message cannot exceed 2000 characters."
            );

            return;
        }


        if (!socket) {

            console.error(
                "Socket is not connected"
            );

            return;
        }


        // ============================
        // ROOM MESSAGE
        // ============================

        if (selectedRoom) {

            console.log(
                "Sending room message:",
                {
                    roomId:
                        selectedRoom._id,
                    content
                }
            );


            socket.emit(
                "roomMessage",
                {
                    roomId:
                        selectedRoom._id,
                    content
                }
            );


            messageInput.value = "";

            messageInput.focus();

            return;
        }


        // ============================
        // PRIVATE MESSAGE
        // ============================

        if (selectedUser) {

            console.log(
                "Sending private message:",
                {
                    receiverId:
                        selectedUser._id,
                    content
                }
            );


            socket.emit(
                "privateMessage",
                {
                    receiverId:
                        selectedUser._id,
                    content
                }
            );


            messageInput.value = "";

            messageInput.focus();

            return;
        }


        console.log(
            "No user or room selected"
        );
    }
);


// ================================
// ENTER TO SEND
// ================================

messageInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();


            if (
                messageInput.value.trim()
            ) {

                messageForm.dispatchEvent(
                    new Event(
                        "submit",
                        {
                            bubbles: true,
                            cancelable: true
                        }
                    )
                );
            }
        }
    }
);


// ================================
// GET USER ID FROM TOKEN
// ================================

function getUserIdFromToken() {

    if (!token) {
        return null;
    }


    try {

        const payload =
            JSON.parse(
                atob(
                    token.split(".")[1]
                )
            );


        return (
            payload.userId ||
            payload.id ||
            payload._id ||
            null
        );

    } catch (error) {

        console.error(
            "Token decode error:",
            error
        );

        return null;
    }
}


// ================================
// DISPLAY MESSAGE
// ================================

function displayMessage(message) {

    if (
        !message ||
        !message.content
    ) {
        return;
    }


    const element =
        document.createElement(
            "div"
        );


    // Handle populated sender
    // and normal ObjectId sender
    const senderId =
        typeof message.sender === "object" &&
        message.sender

            ? String(
                message.sender._id ||
                message.sender.id
            )

            : String(
                message.sender
            );


    const myUserId =
        currentUser

            ? String(
                currentUser._id ||
                currentUser.id
            )

            : getUserIdFromToken();


    element.className =
        senderId === myUserId
            ? "message mine"
            : "message";


    element.innerHTML = `
        ${escapeHtml(message.content)}

        <span class="message-time">
            ${new Date(
                message.createdAt
            ).toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )}
        </span>
    `;


    messagesContainer.appendChild(
        element
    );


    scrollMessages();
}


// ================================
// UPDATE USER STATUS
// ================================

function updateUserStatus(
    userId,
    online
) {

    const userButton =
        document.querySelector(
            `.user[data-user-id="${userId}"]`
        );


    if (!userButton) {
        return;
    }


    const status =
        userButton.querySelector(
            ".user-status"
        );


    if (!status) {
        return;
    }


    status.textContent =
        online
            ? "Online"
            : "Offline";


    status.classList.toggle(
        "online",
        online
    );


    if (
        selectedUser &&
        String(selectedUser._id) ===
        String(userId)
    ) {

        chatStatus.textContent =
            online
                ? "Online"
                : "Offline";


        selectedUser.isOnline =
            online;
    }
}


// ================================
// SCROLL MESSAGES
// ================================

function scrollMessages() {

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}


// ================================
// ESCAPE HTML
// ================================

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;
}


// ================================
// LOGOUT
// ================================

function logout() {

    if (socket) {

        socket.disconnect();

        socket = null;
    }


    localStorage.removeItem(
        "token"
    );


    token = null;

    currentUser = null;

    selectedUser = null;

    selectedRoom = null;


    showAuth();


    authForm.reset();


    userList.innerHTML =
        "";


    if (roomList) {

        roomList.innerHTML =
            "";
    }


    messagesContainer.innerHTML = `
        <div class="empty-state">
            Select someone to start chatting.
        </div>
    `;


    messageInput.disabled =
        true;


    messageButton.disabled =
        true;
}


// ================================
// LOGOUT BUTTON
// ================================

logoutButton.addEventListener(
    "click",
    logout
);


// ================================
// RESTORE SESSION
// ================================

async function restoreSession() {

    if (!token) {

        showAuth();

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/auth/me`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Invalid session"
            );
        }


        const data =
            await response.json();


        currentUser =
            data.user;


        showChat();


        connectSocket();

        loadUsers();

        loadRooms();

    } catch (error) {

        console.error(
            "Session restore failed:",
            error
        );


        localStorage.removeItem(
            "token"
        );


        token = null;

        currentUser = null;


        showAuth();
    }
}


// ================================
// START APP
// ================================

restoreSession();