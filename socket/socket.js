const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const serverHttp = http.createServer(app);
const io = new Server(serverHttp, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

const broadcastGameUpdate = (game) => io.emit("gameUpdate", game);

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId !== "undefined") userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = {
  app,
  serverHttp,
  io,
  broadcastGameUpdate,
  getReceiverSocketId,
};
