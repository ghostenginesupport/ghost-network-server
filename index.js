// index.js
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(PORT, { 
    cors: { origin: "*" } // Sab nu connect hon di permission
});

let ghostPlayers = {}; 

io.on('connection', (socket) => {
    console.log('New Ghost Connected:', socket.id);

    socket.on('update_my_ghost', (data) => {
        ghostPlayers[socket.id] = {
            id: data.id,
            name: data.name,
            color: data.color
        };
        io.emit('ghost_map_sync', getGhostMap());
    });

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

console.log(`Ghost Server is running on port ${PORT}...`);
