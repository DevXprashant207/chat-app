import {Server} from 'socket.io';
import http from 'http';
import express from 'express';
import {ENV} from './env.js'
import {socketAuthMiddleware} from '../middleware/socket.auth.middleware.js';

const app = express();
const server = http.createServer(app);
const CLIENT_ORIGIN = ENV.CLIENT_URL || 'https://chat-app-0mjs.onrender.com/';
const io = new Server(server,{
    cors: {
        origin: [CLIENT_ORIGIN],
        methods: ["GET", "POST"],
        credentials: true
    }
});
export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

const userSocketMap = {};
io.on('connection', (socket) => {
    console.log('New client connected:', socket.user.fullname);
    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    io.emit("getonlineUsers", Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        delete userSocketMap[userId];
        io.emit("getonlineUsers", Object.keys(userSocketMap));
        console.log('Client disconnected:', socket.user.fullname);
    });
});

export {io, app, server, userSocketMap};