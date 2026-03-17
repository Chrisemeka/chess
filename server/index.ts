import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
    origin: "http://localhost:3000", 
  }
});

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("ping", (data) => {
      console.log(`Received ping from client ${socket.id}:`, data);

      socket.emit("pong", { message: "Hello from Server!", timestamp: new Date()});
    })

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

httpServer.listen(3001, () => {
  console.log('Server is listening on port 3001');
});