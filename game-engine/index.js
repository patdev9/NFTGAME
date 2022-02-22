"use strict";
require('dotenv').config({path: '.env'});
process.on('uncaughtException', function (err) {
    console.error(err);
    //process.exit(1);
});
process.setMaxListeners(0);

require('events').EventEmitter.defaultMaxListeners = 0;

const chalk = require('chalk');
const magenta = function () {
    console.log(chalk.magenta(...arguments))
};
const cyan = function () {
    console.log(chalk.cyan(...arguments))
};
const yellow = function () {
    console.log(chalk.yellow(...arguments))
};
const red = function () {
    console.log(chalk.red(...arguments))
};
const blue = function () {
    console.log(chalk.blue(...arguments))
};
const green = function () {
    console.log(chalk.green(...arguments))
};

const cors = require('cors');
const Web3 = require('web3');
const express = require("express");
const http = require("http");
const web3 = new Web3(process.env.RPC);

const jsonInterface = [
    {"inputs": [], "name": "getOpenBets", "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "winner", "type": "uint256"}, {"internalType": "uint256", "name": "looser", "type": "uint256"}], "name": "bet", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
];

const ctx = new web3.eth.Contract(jsonInterface, process.env.CONTRACT);

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

async function onWin(io, r, hpList, roomId){
    let winnerId, total = 0;
    for (let id in hpList) {
        total++;
        if (hpList[id] >= 100)
            continue;
        if (winnerId) {
            red('!winnerId');
            // stop, we need only one winner
            return false;
        }
        winnerId = id;
    }

    if( total > 1 ) {
        const resWinner = {
            room: roomId,
            winner: winnerId,
            message: winnerId + ': win! Participants: '
        }
        red(resWinner.message);
        io.emit(r.room, resWinner);
        return true;
    }
    return false;
}

async function server(){

    const bodyParser = require('body-parser');
    const express = require('express');
    const http = require("http");
    const app = express();
    let server = http.createServer(app);

    server.listen(process.env.HTTP_PORT, '0.0.0.0', function (err) {
        if (err) {
            throw err;
        } else {
            const a = server.address();
            const addr = a.family + '://' + a.address + ':' + a.port;
            green(addr)
        }
    });


    const io = require('socket.io').listen(server);
    let rooms = {};
    io.on('connection', function (socket) {
        const remoteAddress = socket.handshake.address;
        console.log(remoteAddress);
        socket.on('disconnect', () => {
            red('user disconnected', socket.roomId, socket.id);
            const roomId = socket.roomId;
            let room = rooms[roomId];
            if( ! room ) return;
            let clients = room.clients;
            if( ! clients ) return;
            let newClients = [];
            for( let i in clients ){
                if( clients[i] == socket.id)
                    continue;
                newClients.push(clients[i]);
            }
            room.clients = newClients;
            rooms[roomId] = room;

            const res = {room: roomId, message: socket.id+' left'}
            io.emit(roomId, res);

        });
        socket.on('pp',(r)=>{console.log(r)})
        socket.on('message', (r) => {
            if( r.join ) {
                const roomId = r.roomId;
                let room = rooms[roomId] || {};
                socket.roomId = roomId;
                let clients = room.clients || [];
                clients.push(socket.id);
                room.clients = clients;
                rooms[roomId] = room;
                green('join', roomId, socket.id);
                // console.log(rooms);
            }else if( r.fight ){
                const roomId = r.room;
                let room = rooms[roomId] || {};
                if(room.lastFighter == socket.id){
                    const res = {room: roomId, message: socket.id+': you already fighted'}
                    io.emit(r.room, res);
                    return;
                }
                let clients = room.clients || [];
                // console.log(room)
                // console.log(clients)
                if( clients.length > 1 ){
                    const hpList = room.hp || {};
                    for( let i in clients ){
                        const id = clients[i];
                        if( id == socket.id){
                            if( hpList[id] == 100 ){
                                const res = {room: roomId, message: socket.id+': you already lost'}
                                io.emit(r.room, res);
                                if(onWin(io, r, hpList, roomId) === true ){
                                    red('DELETE ROOM!');
                                    delete rooms[roomId];
                                }
                                return;
                            }
                            continue;
                        }
                        const hit = randomIntFromInterval(1, 100);
                        let hp = hpList[id] || 0;
                        hp += hit;
                        if( hp > 100 ) hp = 100;
                        hpList[id] = hp;
                    }
                    room.hp = hpList;
                    room.lastFighter = socket.id;
                    const res = {room: roomId, message: JSON.stringify(hpList)}
                    io.emit(r.room, res);
                    if( onWin(io, r, hpList, roomId) === true ){
                        red('DELETE ROOM!!');
                        delete rooms[roomId];
                    }
                }else{
                    const res = {room: roomId, message: socket.id+': no enough participants: '+clients.length}
                    io.emit(r.room, res);
                }
            }else if (r.bet && r.winner && r.looser) {
                async function _bet(){
                    // await ctx.methods.bet(r.winner, r.looser).call();
                    r.cmd = r.message;
                    console.log(r);
                    io.emit(r.room, r);
                }
                _bet();
            }else if (r.message == '/getOpenBets') {
                async function _getOpenBets(){
                    const getOpenBets = (await ctx.methods.getOpenBets().call()).toString();
                    console.log(r.room, getOpenBets);
                    r.cmd = r.message;
                    r.message = getOpenBets;
                    console.log(r);
                    io.emit(r.room, r);
                }
                _getOpenBets();
            } else {
                // broadcast
                const room = r.room;
                const message = r.message;
                yellow(room, message);
                io.emit(room, r);
            }
        });
    });

    app.use(function (req, res, next) {
        res.removeHeader('X-Powered-By');
        next();
    });


    app.use(cors({"origin": ['*'], "methods": ['GET', 'OPTIONS']}));

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
}

async function main(){
    try {
        yellow('contract: '+process.env.CONTRACT);
        const getOpenBets = await ctx.methods.getOpenBets().call();
        console.log('getOpenBets', getOpenBets);
        await server();
    } catch (e) {
        const msg = e.toString();
        red(msg)
        process.exit(1);
    }

}
main();
