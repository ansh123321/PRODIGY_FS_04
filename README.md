# Chatter — Real-Time Chat Application

Chatter is a full-stack real-time messaging application built during my Full-Stack Development Internship at Prodigy InfoTech.

The project focuses on implementing real-time communication, user authentication, private messaging, chat rooms, online/offline status, and persistent message storage.

## Features

- User registration and login
- JWT-based authentication
- Secure password hashing with bcrypt
- Real-time private messaging
- Real-time chat rooms
- Online/offline user status
- Persistent message history
- Message timestamps
- Responsive dark-themed interface
- Message length validation
- Automatic session restoration

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT
- bcrypt

### Database
- MongoDB
- Mongoose

## Project Structure

```text
PRODIGY_FS_04/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
└── README.md