"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [serverResponse, setServerResponse] = useState("");

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Connected!");
      setSocket(socket);
    });

    // Listen for the "pong" message from the server
    socket.on("pong", (data) => {
      setServerResponse(data.message);
    });

    return () => { socket.disconnect(); };
  }, []);

  const sendPing = () => {
    if (socket) {
      socket.emit("ping", { clientMsg: "Is anyone there?" });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Connection Test</h1>
      <button onClick={sendPing} disabled={!socket}>
        Send Ping to Server
      </button>
      <p><strong>Server says:</strong> {serverResponse || "Waiting for interaction..."}</p>
    </div>
  );
}