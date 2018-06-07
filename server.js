var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mqtt = require('mqtt');

http.listen(4201, function () {
    console.log('listening on *:4201');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('connect-to-mqtt', function (data) {
        connectToMqtt(data, socket);
    });
});

var mqttClient;

function connectToMqtt(data, socket) {
    console.log('Connection data: ' + JSON.stringify(data));
    mqttClient = mqtt.connect('mqtt://localhost:7707', {username: data.username, password: data.password});
    mqttClient.on('connect', function () {
        socket.emit('mqtt-connection/' + data.username);
    })
}