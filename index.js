'use strict';

const o = doLog => console.log(doLog);

const WebSocketServer = require('ws').Server;
const http = require('http');
const fs = require('fs');

o('starting');
var _wss = new WebSocketServer({
    port: 9000
});

_wss.broadcast = data => {
    _wss.clients.forEach(client => client.send(data));
}

_wss.on('connection', conn => {
    conn.on('message', msg => o('msg from conn: ' + msg));
    conn.send('You have connected to me!');
});

const heartbeat = () => {
    o('heartbeat');
    _wss.broadcast('hb');
};

const sendData = () => {
    _wss.broadcast(new Date().toISOString());
};

const start = () => {
    o('start called');
    setInterval(heartbeat, 5000);
    setInterval(sendData, 1000);
}

o('Starting http server...');
const __server = http.createServer(function (request, response) {
    fs.readFile('./index.html', function (err, data) {
        if (err) {
            response.writeHead(500, {
                'Content-Length': err.length,
                'Content-Type': 'text/plain'
            });
            response.end(err, 'utf-8');
        } else {
            response.writeHead(200, {
                'Content-Length': data.length,
                'Content-Type': 'text/html'
            });
            response.end(data, 'utf-8');
        }
    });
}).on('close', function () {
    o('Server closed...');
}).on('clientError', function (exception, socket) {
    o("Client error : '" + exception + "'");
}).listen(8888);

start();
