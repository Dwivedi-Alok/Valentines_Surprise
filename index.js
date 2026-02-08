import express from "express";
import dotenv from "dotenv";
import presignedRoutes from "./src/routes/presigned.routes.js";
import mailRoutes from "./src/routes/mail.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import todoRoutes from "./src/routes/todo.routes.js";
import urlRoutes from "./src/routes/url.routes.js";
import coupleRoutes from "./src/routes/couple.routes.js";
import mediaRoutes from "./src/routes/media.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import { connectDB } from "./src/lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";
import { initCronJobs } from "./src/lib/cron.js";

dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import User from "./src/models/user.model.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins in development
    credentials: true,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
}));

app.use("/presigned", presignedRoutes);
app.use("/mail", mailRoutes);
app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/urls", urlRoutes);
app.use("/couple", coupleRoutes);
app.use("/media", mediaRoutes);
app.use("/profile", profileRoutes);
app.use("/payment", paymentRoutes);

app.use(errorMiddleware);

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  // Tic-Tac-Toe Events
  socket.on("send_move", (data) => {
    socket.to(data.room).emit("receive_move", data);
  });

  socket.on("game_reset", (data) => {
    socket.to(data.room).emit("receive_reset", data);
  });

  // Live Location Events
  socket.on("send_location", async (data) => {
    // data = { room, latitude, longitude, userId }
    socket.to(data.room).emit("receive_location", data);

    try {
      if (data.userId) {
        await User.findByIdAndUpdate(data.userId, {
          lastLocation: {
            latitude: data.latitude,
            longitude: data.longitude,
            updatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const port = process.env.PORT || 5000;
app.get("/health", (req, res) => {
  res.send("Presigned URL Service is running 🚀");
});

httpServer.listen(port, () => {
  connectDB();
  initCronJobs();
  console.log(`server is running on http://localhost:${port}`);
});
