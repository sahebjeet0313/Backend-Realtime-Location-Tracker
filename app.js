const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'ejs');

// Use app.use to serve static files
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {
    socket.on("send-location", function (data) {
        console.log(data);
        io.emit("recieve-location", { id: socket.id, ...data });
    });
    console.log('connected');

    socket.on("disconnect", function () {
        io.emit("user-disconnected", socket.id);
    });
});

app.get('/', function (req, res) {
    res.render('index');
});

server.listen(4000, '0.0.0.0', () => {
    console.log('Server running on port 4000');
});