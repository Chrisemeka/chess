# 2D Chess Multiplayer

A real-time multiplayer 2D chess game built using a modern full-stack JavaScript environment. It features a sleek, minimalist UI, private match creation, and socket-based real-time state synchronization.

## 🚀 Tech Stack

### Frontend (Client)
- **Framework:** [Next.js](https://nextjs.org/) (React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Chess Logic:** [`chess.js`](https://github.com/jhlywa/chess.js) - handles multi-turn state, move legalities, and game lifecycle 
- **Real-Time Communication:** [`socket.io-client`](https://socket.io/)

### Backend (Server)
- **Environment:** Node.js
- **Real-Time Engine:** [`socket.io`](https://socket.io/)
- **Language:** TypeScript 

## 📦 Project Structure

```
chess/
├── client/           # The Next.js frontend application 
│   ├── app/          # App router containing UI components
│   └── package.json  # Client dependencies
├── server/           # The Node.js websockets server
│   ├── index.ts      # Main socket handlers and event emitters
│   └── package.json  # Server dependencies
└── package.json      # Monorepo root, containing useful dev scripts 
```

## 🛠️ Local Setup Instructions

Follow these steps to set up and run the application on your local machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. 

### 1. Clone the repository
Clone the codebase and navigate into the root directory:
```bash
git clone <repository-url>
cd chess
```

### 2. Install Dependencies
Because this is set up as a simple local monorepo, you need to navigate to both the `client` and `server` folders and install their respective packages. 

**For the Client:**
```bash
cd client
npm install
cd ..
```

**For the Server:**
```bash
cd server
npm install
cd ..
```

### 3. Start the Development Servers

From the **root directory** of the project (`chess/`), run the following command. It will use `concurrently` (via `npx`) to boot up both the Next.js client and the Node.js server at the same time:

```bash
npm run dev
```

Alternatively, you could start them up in separate terminal instances:
- **Server Terminal:** `cd server && npm run dev`
- **Client Terminal:** `cd client && npm run dev`

### 4. Play!
The application will be accessible via **http://localhost:3000**.
The server listens for socket connections on **http://localhost:3001**.

To test multiplayer locally:
1. Open http://localhost:3000 in your browser.
2. Click **Create Game**.
3. Copy the generated Room Code.
4. Open an incognito window or another browser and navigate to http://localhost:3000.
5. Enter the copied Room Code and click **Join Game**.

Enjoy playing chess!
