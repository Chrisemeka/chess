"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Chess } from "chess.js";

interface ChessBoardProps {
  socket: Socket | null;
  roomId: string;
  myColor: "w" | "b" | null;
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [gameStarted, setGameStarted] = useState<boolean>(false); 
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
    const newSocket = io(socketUrl);
    setSocket(newSocket); 
    
    newSocket.on('game-created', (data: { roomId: string }) => {
      setRoomId(data.roomId);
      setPlayerColor("w");  
    })

    newSocket.on("player-joined", (data: { roomId: string, players: string[] }) => {
      console.log("Opponent joined room!,", data);
      setGameStarted(true);
      setRoomId(data.roomId);
      setPlayerColor(prev => prev || "b");
    });

    newSocket.on("error", (msg: any) => {
      alert(msg.message || msg);
    });

    return () => {newSocket.disconnect()};
  }, []);

  const createGame = () => socket?.emit("create-game");

  const joinGame = () => {
    if (inputRoomId.trim()) {
      socket?.emit("join-game", inputRoomId);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden selection:bg-neutral-800">
      
      {/* Abstract Background Grid to depict chess board faintly */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <div className="z-10 w-full flex flex-col items-center">
        {!gameStarted && (
          <div className="mb-16 flex flex-col items-center select-none">
            <div className="flex gap-4 text-3xl mb-6 text-neutral-800">
              <span>♜</span>
              <span>♞</span>
              <span>♝</span>
              <span>♛</span>
              <span>♚</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light tracking-[0.4em] uppercase text-neutral-100 mb-3 ml-[0.4em]">
              Chess
            </h1>
            <div className="h-[1px] w-12 bg-neutral-800 mb-3"></div>
            <p className="text-neutral-500 text-xs tracking-widest uppercase">Multiplayer</p>
          </div>
        )}

        {!roomId && !gameStarted && (
          <div className="flex flex-col gap-6 w-full max-w-xs">
            <button 
              onClick={createGame}
              className="group relative w-full flex items-center justify-center bg-neutral-100 text-neutral-950 py-4 font-medium transition-all hover:bg-white active:scale-[0.98]"
            >
              <span className="tracking-wide uppercase text-sm">Create Game</span>
            </button>
            
            <div className="relative flex items-center my-2">
              <div className="flex-grow border-t border-neutral-900"></div>
              <span className="flex-shrink mx-4 text-neutral-600 text-[10px] tracking-widest uppercase">Or</span>
              <div className="flex-grow border-t border-neutral-900"></div>
            </div>

            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Room Code"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                className="w-full bg-neutral-900/40 border border-neutral-800 p-4 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900 transition-all text-center font-mono text-lg tracking-widest placeholder:text-neutral-700 uppercase"
              />
              <button 
                onClick={joinGame}
                className="w-full bg-transparent border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600 py-4 font-medium transition-all active:scale-[0.98]"
              >
                <span className="tracking-wide uppercase text-sm">Join Game</span>
              </button>
            </div>
          </div>
        )}

        {roomId && !gameStarted && (
          <div className="flex flex-col items-center w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-neutral-500 text-xs tracking-widest uppercase mb-8">Room Created</p>
            
            <div className="flex flex-col items-center w-full bg-neutral-900/20 border border-neutral-800/50 p-8 mb-10 backdrop-blur-sm">
              <span className="text-neutral-600 text-[10px] mb-4 uppercase tracking-widest">Share this code</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  alert("Copied!");
                }}
                className="group flex flex-col items-center gap-3 transition-colors"
                title="Click to copy"
              >
                <span className="text-4xl sm:text-5xl font-mono text-neutral-200 group-hover:text-white tracking-[0.2em] ml-[0.2em] transition-colors">{roomId}</span>
                <span className="text-neutral-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Click to copy</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-neutral-400">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-500"></span>
              </div>
              <p className="text-xs tracking-widest uppercase text-neutral-500">Waiting for opponent</p>
            </div>
          </div>
        )}

        {gameStarted && (
          <div className="w-full max-w-3xl flex flex-col items-center animate-in fade-in duration-1000">
            <div className="w-full flex justify-between items-center mb-10 px-2 text-neutral-500 text-xs tracking-widest uppercase">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500/40 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500/80"></span>
                </span>
                <span>Live</span>
              </div>
              <div className="flex gap-8">
                <span>Room <span className="text-neutral-300 font-mono ml-2">{roomId}</span></span>
                <span>Playing as <span className="text-neutral-300">{playerColor === 'w' ? 'White' : 'Black'}</span></span>
              </div>
            </div>
            
            <ChessBoard socket={socket} roomId={roomId} myColor={playerColor}/>
          </div>
        )}
      </div>
    </main>
  );

  function ChessBoard({ socket, roomId, myColor }: ChessBoardProps) {
    const [game, setGame] = useState(new Chess());
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [optionSquares, setOptionSquares] = useState<string[]>([]);

    useEffect(() => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      alert(`CHECKMATE! ${winner} wins the game.`);
    } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
      alert("GAME OVER: It's a draw!");
    }
  }, [game]);

    useEffect(() => {
      if (!socket) return;

      socket.on("move-received", (move: { from: string, to: string }) => {
        const gameCopy = new Chess(game.fen());
        gameCopy.move(move);
        setGame(gameCopy);
      });

      return () => { socket.off("move-received"); };
    }, [socket, game]);

    const onSquareClick = (square: string) => {

    const isMyTurn = game.turn() === myColor;
    if (!isMyTurn) return; 

    const piece = game.get(square as any);

    if (!selectedSquare) {
      if (piece && piece.color === myColor) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as any, verbose: true });
        setOptionSquares(moves.map(m => m.to));
      }
      return;
    }

    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({
        from: selectedSquare,
        to: square,
        promotion: "q", 
      });

      if (move) {
        setGame(gameCopy);
        socket?.emit("move", { roomId, move: { from: selectedSquare, to: square, promotion: "q" } });
      }
    } catch (e) {
      if (piece && piece.color === myColor) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as any, verbose: true });
        setOptionSquares(moves.map(m => m.to));
        return; 
      }
    }

    setSelectedSquare(null);
    setOptionSquares([]);
  };

    const rows = [8, 7, 6, 5, 4, 3, 2, 1];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    return (
      <div className={`grid grid-cols-8 border-[12px] border-slate-800 rounded-sm shadow-2xl ${myColor === 'b' ? 'rotate-180' : ''}`}>
        {rows.map((row, rIdx) => (
          cols.map((col, cIdx) => {
            const square = `${col}${row}`;
            const piece = game.get(square as any);
            const isDark = (rIdx + cIdx) % 2 !== 0;
            const isSelected = selectedSquare === square;
            const isOption = optionSquares.includes(square);

            return (
              <div 
                key={square}
                onClick={() => onSquareClick(square)}
                className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center relative cursor-pointer
                  ${isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'}
                  ${isSelected ? 'bg-yellow-200/80' : ''} 
                `}
              >
                {isOption && (
                  <div className="absolute w-4 h-4 bg-black/10 rounded-full z-0" />
                )}

                {piece && (
                  <img 
                    src={`/pieces/${piece.color}${piece.type.toUpperCase()}.svg`} 
                    className={`w-4/5 h-4/5 ${myColor === 'b' ? 'rotate-180' : ''} `}
                  />
                )}
              </div>
            );
          })
        ))}
      </div>
    );
  }
}