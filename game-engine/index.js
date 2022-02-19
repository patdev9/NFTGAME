"use strict";
process.on('uncaughtException', function (err) {
    console.error(err);
    //process.exit(1);
});
process.setMaxListeners(0);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
require('events').EventEmitter.defaultMaxListeners = 0;
const bodyParser = require('body-parser');
const express = require('express');
const http = require("http");
const app = express();
let server = http.createServer(app);
server.listen(3002, '0.0.0.0', function (err) {
    if (err) {
        throw err;
    } else {
        const a = server.address();
        const addr = a.family + '://' + a.address + ':' + a.port;
        console.log(addr)
    }
});


const io = require('socket.io').listen(server);
io.on('connection', function(socket){
          const remoteAddress = socket.handshake.address;
          console.log(remoteAddress);
          socket.on('disconnect', () => {
              console.log('user disconnected');
          });
          socket.on('message', (r) => {
              const room = r.room;
              const message = r.message;
              console.log(room, message);
              io.emit(room, r);
          });
      });

app.use(function (req, res, next) {
    res.removeHeader('X-Powered-By');
    next();
});
app.set('trust proxy', 1); // trust first proxy
app.set('json spaces', 40);
app.use((req, res, next) => {
    req.IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next();
});
app.use(bodyParser.json());
app.get("/", function (req, res) {
    res.sendFile(__dirname + '/html/index.html');
})
app.use(express.static('./html'));
