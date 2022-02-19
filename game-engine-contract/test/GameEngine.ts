import {formatUnits, parseUnits} from "@ethersproject/units/src.ts/index";

const {ethers} = require("hardhat");
const {solidity} = require("ethereum-waffle");
const {expect} = require("chai");
require("@nomiclabs/hardhat-web3");
import {ContractFactory, constants, utils, Contract, BigNumber} from 'ethers';

const chalk = require('chalk');
// let _yellowBright = chalk.yellowBright;
const _magenta = chalk.magenta;
const _cyan = chalk.cyan;
const _yellow = chalk.yellow;
const _red = chalk.red;
const _blue = chalk.blue;
const _green = chalk.green;

function toWei(v: string): string {
    return utils.parseUnits(v, 18).toString();
}

function fromWei(v: string): string {
    return utils.formatUnits(v, 18).toString();
}

function now(x: number) {
    let t = new Date().getTime() / 1000;
    t += x;
    return parseInt(t.toString());
}

describe("GameEngine", () => {
    let dev: string, user: string, user1: string, user2: string, user3: string, feeAddress: string, reserve: string;
    let USER: any, USER1: any, USER2: any, USER3: any;
    let GameEngine: any;
    beforeEach(async () => {
        const [_dev, _user, _user1, _user2, _user3, _feeAddress, _reserve] = await ethers.getSigners();
        USER = _user;
        USER1 = _user1;
        USER2 = _user2;
        USER3 = _user3;
        dev = _dev.address;
        user = _user.address;
        user1 = USER1.address;
        user2 = USER2.address;
        user3 = USER3.address;
        feeAddress = _feeAddress.address;
        reserve = _reserve.address;
        const _GameEngine = await ethers.getContractFactory("GameEngine");
        GameEngine = await _GameEngine.deploy();
    });

    describe("TEST DEPOSIT & BET", () => {
        it("deposit", async () => {
            let _100: string = '100';
            await GameEngine.connect(USER).deposit('1', {value: _100});
            await GameEngine.connect(USER1).deposit('2', {value: _100});
            const contractBalance = (await GameEngine.provider.getBalance(GameEngine.address)).toString();
            expect(contractBalance).to.be.eq('180');

            // check if deposit has be stored at hash
            const betAmountById1 = (await GameEngine.betAmountById('1')).toString();
            const betAmountById2 = (await GameEngine.betAmountById('2')).toString();

            expect(betAmountById1).to.be.eq('90');
            expect(betAmountById2).to.be.eq('90');

            // check if user has last hash
            const lastBetIdBySender1 = (await GameEngine.lastBetIdBySender(user)).toString();
            const lastBetIdBySender2 = (await GameEngine.lastBetIdBySender(user1)).toString();

            expect(lastBetIdBySender1).to.be.eq('1');
            expect(lastBetIdBySender2).to.be.eq('2');

            // we should have 2 hash stored

            const getOpenBets = (await GameEngine.getOpenBets()).toString();
            expect(getOpenBets).to.be.eq('1,2');


        });

        it("BET", async () => {
            let _100: string = '100';
            await GameEngine.connect(USER).deposit('1', {value: _100});
            await GameEngine.connect(USER1).deposit('2', {value: _100});
            await GameEngine.bet('1', '2');

            // amounts should be 0 now
            const betAmountById1 = (await GameEngine.betAmountById('1')).toString();
            const betAmountById2 = (await GameEngine.betAmountById('2')).toString();

            expect(betAmountById1).to.be.eq('0');
            expect(betAmountById2).to.be.eq('0');

            // no more bets
            const getOpenBets = (await GameEngine.getOpenBets()).toString();
            expect(getOpenBets).to.be.eq('');

            // win/loss stats
            const amountGained = (await GameEngine.amountGained(user)).toString();
            const amountLost = (await GameEngine.amountLost(user1)).toString();
            expect(amountGained).to.be.eq('180');
            expect(amountLost).to.be.eq('90');

        });
    });

});
