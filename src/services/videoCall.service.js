import { Server } from "socket.io";

let io;

export const initializeVideoCallService = (socketIoInstance) => {
  io = socketIoInstance;

  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    // Join a room
    socket.on("join-room", ({ roomId, userId }) => {
      console.log(`${userId} joined room: ${roomId}`);
      socket.join(roomId);
      socket.join(userId); // Join a room with their own ID for direct messages
      socket.to(roomId).emit("user-connected", userId);

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`${userId} disconnected from room: ${roomId}`);
        socket.to(roomId).emit("user-disconnected", userId);
      });

      // Handle offer
      socket.on("offer", ({ offer, targetUserId }) => {
        socket.to(targetUserId).emit("offer", { offer, senderId: userId });
      });

      // Handle answer
      socket.on("answer", ({ answer, targetUserId }) => {
        socket.to(targetUserId).emit("answer", { answer, senderId: userId });
      });

      // Handle ICE candidates
      socket.on("ice-candidate", ({ candidate, targetUserId }) => {
        socket.to(targetUserId).emit("ice-candidate", { candidate, senderId: userId });
      });
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized. Call initializeVideoCallService first.");
  }
  return io;
};