// index.js
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

// Render ਨੂੰ ਖੁਸ਼ ਕਰਨ ਲਈ ਇੱਕ ਸਾਧਾਰਨ HTTP Server (Health Check)
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Ghost Network Server is LIVE and Running!');
});

// ਸਾਡਾ ਅਸਲੀ WebSocket (Ghost Engine)
const io = new Server(server, {
    cors: { origin: "*" }
});

let ghostPlayers = {}; 

io.on('connection', (socket) => {
    console.log('New Ghost Connected:', socket.id);

    // ਜਦੋਂ ਕੋਈ ਪਲੇਅਰ ਆਪਣਾ ਡਾਟਾ ਭੇਜਦਾ ਹੈ
    socket.on('update_my_ghost', (data) => {
        ghostPlayers[socket.id] = {
            id: data.id,
            name: data.name,
            color: data.color
        };
        io.emit('ghost_map_sync', getGhostMap());
    });

    // ਜਦੋਂ ਕੋਈ ਪਲੇਅਰ ਆਫ਼ਲਾਈਨ ਹੁੰਦਾ ਹੈ
    socket.on('disconnect', () => {
        delete ghostPlayers[socket.id];
        io.emit('ghost_map_sync', getGhostMap());
    });
});

function getGhostMap() {
    let map = {};
    for (let sid in ghostPlayers) {
        let p = ghostPlayers[sid];
        if(p.name) {
            map[p.name] = p.color; 
        }
    }
    return map;
}

// ਸਰਵਰ ਨੂੰ ਪੋਰਟ 'ਤੇ ਸਟਾਰਟ ਕਰੋ
server.listen(PORT, () => {
    console.log(`Ghost Server is running on port ${PORT}...`);
});
