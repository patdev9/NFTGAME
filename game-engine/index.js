"use strict";
require('dotenv').config({path: '.env'});
process.on('uncaughtException', function (err) {
    console.error(err);
    //process.exit(1);
});
process.setMaxListeners(0);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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
    io.on('connection', function (socket) {
        const remoteAddress = socket.handshake.address;
        console.log(remoteAddress);
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        socket.on('message', (r) => {
            if (r.bet && r.winner && r.looser) {
                async function _bet(){
                    await ctx.methods.bet(r.winner, r.looser).call();
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
