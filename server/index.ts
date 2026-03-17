import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const PORT = Number(process.env.PORT )|| 3000;
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://chess-nine-teal.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const rooms: Record<string, { players: string[] }> = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Event: Create a new game room for two players
  socket.on("create-game", () => {
    const roomId = Math.random().toString(36).substring(2, 8); 

    rooms[roomId] = { players: [socket.id] };

    socket.join(roomId);
    socket.emit("game-created", { roomId });

    console.log(`Game room created with room ID: ${roomId} by ${socket.id}`);
  })

  // Event: Join an existing game room
  socket.on("join-game", (roomId: string) => {
    const room = rooms[roomId];

    if (room && room.players.length < 2) {
      room.players.push(socket.id);
      socket.join(roomId);

      io.to(roomId).emit("player-joined", {roomId, players: room.players});
      console.log(`User ${socket.id} joined game room: ${roomId}`);
    }else {
      socket.emit("error", { message: "Room is full or does not exist." });
    }
  })

  socket.on("move", ({ roomId, move }) => {
    socket.to(roomId).emit("move-received", move);
});

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});