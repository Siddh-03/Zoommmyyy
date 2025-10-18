import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

const options = {
  origin: 'https://zoommmyyy.onrender.com'
};

app.use(cors(options));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true }));

app.set("port", process.env.PORT || 3000);

const start = async () => {
  app.set("Zooom_db");
  const connectionDb = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/Zooom_db");
  console.log(`Database connected: ${connectionDb.connection.host}`);
  server.listen(app.get("port"), () => {
    console.log(`Server is running on port ${app.get("port")}`);
  });
};

app.use("/api/v1/users", userRoutes);

start();
