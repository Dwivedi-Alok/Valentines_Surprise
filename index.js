import express from "express";
import dns from "node:dns";
import dotenv from "dotenv";

try {
  dns.setDefaultResultOrder("ipv4first");
  console.log("DNS Order set to ipv4first");
} catch (error) {
  console.warn("Could not set default DNS result order:", error);
}
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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://valentines-surprise.onrender.com",
  "https://valentines-surprise-frontend.onrender.com" // Assuming this might be the frontend URL or similar
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || true) { // Temporarily allowing all for debugging
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const io = new Server(httpServer, {
  cors: corsOptions
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

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
const startTime = Date.now();

// Comprehensive Health Check
app.get("/health", async (req, res) => {
  const uptimeMs = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);

  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: {
      hours: uptimeHours,
      minutes: uptimeMinutes % 60,
      seconds: uptimeSeconds % 60,
      raw_ms: uptimeMs,
    },
    services: {
      database: "unknown",
      email: "unknown",
    },
  };

  // Check MongoDB connection
  try {
    const mongoose = await import("mongoose");
    const dbState = mongoose.default.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    health.services.database = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";
  } catch (err) {
    health.services.database = "error: " + err.message;
  }

  // Check SMTP connection
  try {
    const { verifyEmailConnection } = await import("./src/services/mail.service.js");
    const smtpStatus = await verifyEmailConnection();
    health.services.email = smtpStatus ? "connected" : "disconnected";
  } catch (err) {
    health.services.email = "error: " + err.message;
  }

  // Set overall status
  if (health.services.database !== "connected" || health.services.email !== "connected") {
    health.status = "degraded";
  }

  res.json(health);
});

httpServer.listen(port, () => {
  connectDB();
  initCronJobs();
  console.log(`server is running on http://localhost:${port}`);
});
