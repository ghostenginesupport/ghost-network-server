const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Allow all connections
});

// ਸਰਵਰ ਦੀ ਮੈਮੋਰੀ (ਡਾਇਰੀ)
const globalSkins = {}; // { skinId: videoUrl }
const socketSkins = {}; // { socket.id: skinId } (ਯਾਦ ਰੱਖਣ ਲਈ ਕਿਹੜੇ ਪਲੇਅਰ ਨੇ ਕਿਹੜੀ ਸਕਿਨ ਲਗਾਈ)

io.on('connection', (socket) => {
    console.log('🟢 Player Connected:', socket.id);

    // ਜਦੋਂ ਕੋਈ ਨਵਾਂ ਪਲੇਅਰ ਆਉਂਦਾ ਹੈ, ਉਸਨੂੰ ਪਹਿਲਾਂ ਤੋਂ ਚੱਲ ਰਹੀਆਂ ਸਾਰੀਆਂ ਵੀਡੀਓਜ਼ ਦੀ ਲਿਸਟ ਦੇ ਦਿਓ
    socket.emit('init_skins', globalSkins);

    // ਜਦੋਂ ਪਲੇਅਰ ਗੇਮ ਵਿੱਚ Spawn ਹੁੰਦਾ ਹੈ (Mass > 0)
    socket.on('set_skin', (data) => {
        if (!data.skinId || !data.videoUrl) return;

        globalSkins[data.skinId] = data.videoUrl;
        socketSkins[socket.id] = data.skinId;

        // ਬਾਕੀ ਸਾਰੇ ਪਲੇਅਰਾਂ ਨੂੰ ਦੱਸੋ ਕਿ ਨਵੀਂ ਵੀਡੀਓ ਲਗਾਓ
        socket.broadcast.emit('update_skin', { skinId: data.skinId, videoUrl: data.videoUrl });
        console.log(`🎥 Skin Added: ${data.skinId} by ${socket.id}`);
    });

    // ਜਦੋਂ ਪਲੇਅਰ ਮਰ ਜਾਂਦਾ ਹੈ (Mass = 0) ਜਾਂ Menu ਵਿੱਚ ਜਾਂਦਾ ਹੈ
    socket.on('remove_skin', () => {
        const skinId = socketSkins[socket.id];
        if (skinId) {
            delete globalSkins[skinId];
            delete socketSkins[socket.id];
            // ਸਾਰਿਆਂ ਨੂੰ ਦੱਸੋ ਕਿ ਵੀਡੀਓ ਹਟਾ ਦਿਓ
            io.emit('delete_skin', { skinId });
            console.log(`❌ Skin Removed: ${skinId}`);
        }
    });

    // ਜਦੋਂ ਪਲੇਅਰ ਬ੍ਰਾਊਜ਼ਰ ਬੰਦ ਕਰ ਦਿੰਦਾ ਹੈ
    socket.on('disconnect', () => {
        const skinId = socketSkins[socket.id];
        if (skinId) {
            delete globalSkins[skinId];
            delete socketSkins[socket.id];
            io.emit('delete_skin', { skinId });
        }
        console.log('🔴 Player Disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Ghost Server running on port ${PORT}`);
});
