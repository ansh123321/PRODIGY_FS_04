# 💬 Chatter — Real-Time Chat Application

Chatter is a full-stack real-time messaging application built during my **Full-Stack Web Development Internship at Prodigy InfoTech**.

The application provides real-time communication between users with authentication, private messaging, chat rooms, online/offline status, and persistent message storage.

The project was built using **Node.js, Express.js, MongoDB, Socket.IO, JWT, and vanilla JavaScript**.

---

## 🚀 Live Demo

🌐 **Live Application:**  
https://chatter-frontend-ix8l.onrender.com/

📦 **Source Code:**  
https://github.com/ansh123321/PRODIGY_FS_04

---

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Secure password hashing using bcrypt
- Automatic session restoration
- Logout functionality

### 💬 Real-Time Messaging

- Real-time private messaging
- Real-time chat rooms
- Instant message delivery using Socket.IO
- Persistent message history
- Message timestamps
- Message length validation

### 🟢 User Presence

- Online/offline user status
- Real-time presence updates
- Active user indication

### 🎨 User Interface

- Modern dark-themed interface
- Glassmorphism-inspired design
- Electric violet/indigo accent colors
- Responsive layout
- Interactive message bubbles
- Smooth UI animations
- Scrollable conversations and user lists

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Socket.IO Client

### Backend

- Node.js
- Express.js
- Socket.IO
- JSON Web Token (JWT)
- bcrypt

### Database

- MongoDB
- Mongoose

### Deployment

- Render
- GitHub

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │                     │
                    │ HTML / CSS / JS     │
                    │ Socket.IO Client    │
                    └──────────┬──────────┘
                               │
                               │ HTTP / WebSocket
                               ▼
                    ┌─────────────────────┐
                    │       Backend       │
                    │                     │
                    │ Node.js             │
                    │ Express.js          │
                    │ Socket.IO           │
                    │ JWT Authentication  │
                    └──────────┬──────────┘
                               │
                               │ Mongoose
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │                     │
                    │ Users               │
                    │ Messages            │
                    │ Chat Data            │
                    └─────────────────────┘
