import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const PORT = Number(process.env.PORT )|| 3001;
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://chess-nine-teal.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

interface Room {
  players: string[];
  timers?: { w: number; b: number };
  turn?: 'w' | 'b';
  lastMoveTimestamp?: number;
  interval?: NodeJS.Timeout;
  state?: 'countdown' | 'playing';
  countdown?: number;
}
const rooms: Record<string, Room> = {};

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

      room.timers = { w: 600000, b: 600000 };
      room.turn = 'w';
      room.state = 'countdown';
      room.countdown = 3;

      io.to(roomId).emit("player-joined", {roomId, players: room.players});
      console.log(`User ${socket.id} joined game room: ${roomId}`);

      room.interval = setInterval(() => {
        if (room.state === 'countdown') {
           io.to(roomId).emit("countdown", { count: room.countdown });
           if (room.countdown === 0) {
             room.state = 'playing';
             room.lastMoveTimestamp = Date.now();
           } else if (room.countdown !== undefined && room.countdown > 0) {
             room.countdown--;
           }
           return;
        }

        if (!room.timers || !room.turn || !room.lastMoveTimestamp || room.state !== 'playing') return;
        
        const now = Date.now();
        const elapsed = now - room.lastMoveTimestamp;
        const currentTimers = { ...room.timers };
        currentTimers[room.turn] -= elapsed;

        const currentTurnTimer = 30000 - elapsed;

        if (currentTimers[room.turn] <= 0 || currentTurnTimer <= 0) {
          currentTimers[room.turn] = 0;
          io.to(roomId).emit("game-over-time", { winner: room.turn === 'w' ? 'b' : 'w' });
          if (room.interval) clearInterval(room.interval);
        }

        io.to(roomId).emit("time-update", { 
           timers: currentTimers, 
           turn: room.turn, 
           turnTimer: currentTurnTimer > 0 ? currentTurnTimer : 0 
        });
      }, 1000);
    }else {
      socket.emit("error", { message: "Room is full or does not exist." });
    }
  })

  socket.on("move", ({ roomId, move }) => {
    const room = rooms[roomId];
    if (room && room.timers && room.turn && room.lastMoveTimestamp && room.state === 'playing') {
        const senderColor = room.players[0] === socket.id ? 'w' : 'b';
        if (room.turn !== senderColor) return;

        const now = Date.now();
        const elapsed = now - room.lastMoveTimestamp;
        room.timers[room.turn] -= elapsed;
        room.timers[room.turn] += 3000; // 3s Increment
        
        room.turn = room.turn === 'w' ? 'b' : 'w';
        room.lastMoveTimestamp = now;

        io.to(roomId).emit("time-update", { timers: room.timers, turn: room.turn, turnTimer: 30000 });
        socket.to(roomId).emit("move-received", move);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (room.players.includes(socket.id)) {
        if (room.interval) clearInterval(room.interval);
      }
    }
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});