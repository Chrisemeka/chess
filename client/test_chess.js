const { Chess } = require("chess.js");

const chess = new Chess();
// move knight from b1 to c3
try {
  chess.move({ from: "b1", to: "c3", promotion: "q" });
  console.log("Move 1 successful: " + chess.fen());
} catch(e) {
  console.log("Move 1 failed:", e.message);
}

try {
  // Move an invalid move to see what error it gives
  chess.move({ from: "a1", to: "a3", promotion: "q" });
} catch(e) {
  console.log("Move 2 failed:", e.message);
}
