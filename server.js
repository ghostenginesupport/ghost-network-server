const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

app.get('/', (req, res) => {
  res.send('Ghost Network Server is Running!');
});

io.on('connection', (socket) => {
  console.log('User Connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('update_skin', (data) => {
    // data must have { room, skinUrl, playerId }
    socket.to(data.room).emit('render_new_skin', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Server running on port ' + PORT));
