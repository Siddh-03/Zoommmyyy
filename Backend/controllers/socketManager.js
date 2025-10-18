import { Server } from "socket.io";

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://zoommmyyy.onrender.com", 
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-call", (roomId) => {
      console.log(`User ${socket.id} is joining room: ${roomId}`);

      socket.join(roomId);

      const clientsInRoom = io.sockets.adapter.rooms.get(roomId);
      const otherClients = [];
      if (clientsInRoom) {
        clientsInRoom.forEach((clientId) => {
          if (clientId !== socket.id) {
            otherClients.push(clientId);
          }
        });
      }

      console.log(`Sending 'all-users' to ${socket.id} with:`, otherClients);
      socket.emit("all-users", otherClients);

      console.log(`Sending 'user-joined' to room ${roomId} for:`, socket.id);
      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender, roomId) => {
      console.log(`Chat in room ${roomId} from ${sender}: ${data}`);
      socket.to(roomId).emit("chat-message", data, sender, socket.id);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      io.emit("user-left", socket.id);
    });
  });

  return io;
};