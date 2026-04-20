const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS allow karna zaroori hai taaki germs.io ton connection aa sake
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.send('Ghost Dimension Sync Server is Online!');
});

io.on('connection', (socket) => {
    console.log('🟢 GHOST CONNECTED:', socket.id);

    // Jadon koi player private room join karda hai
    socket.on('join_dimension', (roomCode) => {
        socket.join(roomCode);
        console.log(`[${socket.id}] joined dimension: ${roomCode}`);
    });

    // Jadon script game ton position te video skin link sniff karke bhejdi hai
    socket.on('sync_ghost_data', (data) => {
        // data = { room: "ManjeetVIP", name: "lol..", x: 100, y: 200, skinUrl: "video.mp4" }
        
        // Baki sab players nu eh data bhej do jo usay room vich ne
        socket.to(data.room).emit('ghost_update', data);
    });

    socket.on('disconnect', () => {
        console.log('🔴 GHOST DISCONNECTED:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Ghost Server running on port ${PORT}`);
});
