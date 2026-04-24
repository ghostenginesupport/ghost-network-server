const express = require("express");
const app = express();

const http = require("http").createServer(app);

const io = require("socket.io")(http, {
    cors: {
        origin: "*"
    }
});

app.get("/", (req, res) => {
    res.send("Ghost Network Server Running");
});

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join_room", (room) => {
        socket.join(room);
        console.log(socket.id + " joined room: " + room);
    });

    socket.on("update_skin", (data) => {
        console.log("Skin Update:", data);

        socket.to(data.room).emit("render_new_skin", data);
    });

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
