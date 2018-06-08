var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mqtt = require('mqtt');

http.listen(4201, function () {
    console.log('listening on *:4201');
});

io.on('connection', function (socket) {
    console.log('a user connected');

    var mqttClient = null;
    socket.on('connect-to-mqtt', function (data) {
        mqttClient = connectToMqtt(data, socket);

        // notify client about mqtt connection
        mqttClient.on('connect', function () {
            socket.emit('mqtt-connection/' + data.username);
            handleMqttSub(mqttClient, socket);
        });


    });

    // Handle disconnect SCOKET user
    socket.on('disconnect', function() {
        console.log('Disconnect SOCKET user');
        if (mqttClient != null) {
            console.log('Disconnect MQTT user');
            mqttClient.end();
        }
    });

});

function connectToMqtt(data) {
    console.log('Connection to MQTT with data: ' + JSON.stringify(data));
    return mqtt.connect('mqtt://localhost:7707', {username: data.username, password: data.password});
}

function handleMqttSub(mqttClient, socket) {

    // redirect from SOCKET to MQTT
    socket.on('mqtt-sub', function (data) {
        console.log(data);
        var topic = data.topic;
        var payload = data.payload;
        console.log('Send to MQTT: topic = ' + topic + ' with payload = ' + JSON.stringify(payload));
        mqttClient.subscribe(topic);
        // mqttClient.publish(topic, JSON.stringify(payload));
    });

    // redirect from MQTT to SOCKET
    mqttClient.on('message', function (topic, message) {

        //Convert from Buffer to Object
        var decodedString = String.fromCharCode.apply(null, new Uint8Array(message));
        var payload = JSON.parse(decodedString);

        console.log('Send to SOCKET: topic = ' + topic + ' with payload = ' + JSON.stringify(payload));
        socket.emit(topic, payload);
    })
}