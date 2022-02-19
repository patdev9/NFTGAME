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
    return utils.parseUnits(v, 9).toString();
}

function fromWei(v: string): string {
    return utils.formatUnits(v, 9).toString();
}

function now(x: number) {
    let t = new Date().getTime() / 1000;
    t += x;
    return parseInt(t.toString());
}

describe("Token contract", () => {
    let weth: any, factory: any, router: any, token: any;
    let s_reserve: any;
    let dev: string, user: string, user1: string, user2: string, user3: string, feeAddress: string, reserve: string;
    let MINTED: string = toWei('1000');
    let ONE: string = toWei('1');
    let CEM: string = toWei('100');
    let USER: any, USER1: any, USER2: any, USER3: any;
    beforeEach(async () => {
        const [_dev, _user, _user1, _user2, _user3, _feeAddress, _reserve] = await ethers.getSigners();
        s_reserve = _reserve;
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
        const _Token = await ethers.getContractFactory("Token");
        const _WSDN = await ethers.getContractFactory("WSDN");
        // const UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");
        const _UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
        const _UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02");

        weth = await _WSDN.deploy();
        factory = await _UniswapV2Factory.deploy();
        router = await _UniswapV2Router02.deploy();
        const pairCodeHash = await factory.pairCodeHash();
        // console.log('pairCodeHash', pairCodeHash);
        await router.init(factory.address, weth.address);
        token = await _Token.deploy(dev, router.address);


    });

    describe("Swap", () => {
        it("Add liquidity and swap both sides", async () => {
            let _1: string = toWei('1');
            let _50: string = toWei('50');
            let _1T: string = toWei('1000000000000');
            let _1M: string = toWei('1000000');
            await token.approve(router.address, '9999999999999999999999999999999999999999');
            await token.connect(USER).approve(router.address, '9999999999999999999999999999999999999999');
            await router.addLiquidityETH(token.address, _1T, 0, 0, dev, now(100), {value: _50});

            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
                (0, [weth.address, token.address], user, now(100), {from: user, value: _1});

            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
                ((await token.balanceOf(user)).toString(), 0, [token.address, weth.address], user, now(100), {from: user});
        });

        it("Do 10 buy and 10 sell", async () => {
            let _1: string = toWei('1');
            let _50: string = toWei('50');
            let _1T: string = toWei('1000000000000');
            let _1M: string = toWei('1000000');
            await token.approve(router.address, '9999999999999999999999999999999999999999');
            await token.connect(USER).approve(router.address, '9999999999999999999999999999999999999999');
            await router.addLiquidityETH(token.address, _1T, 0, 0, dev, now(100), {value: _50});

            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
            (0, [weth.address, token.address], user, now(100), {from: user, value: _1});
            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
            (0, [weth.address, token.address], user, now(100), {from: user, value: _1});
            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
            (0, [weth.address, token.address], user, now(100), {from: user, value: _1});
            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
            (0, [weth.address, token.address], user, now(100), {from: user, value: _1});
            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
            (0, [weth.address, token.address], user, now(100), {from: user, value: _1});
            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
            (0, [weth.address, token.address], user, now(100), {from: user, value: _1});
            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
            (0, [weth.address, token.address], user, now(100), {from: user, value: _1});
            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
            (0, [weth.address, token.address], user, now(100), {from: user, value: _1});
            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
            (0, [weth.address, token.address], user, now(100), {from: user, value: _1});
            await router.connect(USER).swapExactETHForTokensSupportingFeeOnTransferTokens
            (0, [weth.address, token.address], user, now(100), {from: user, value: _1});

            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
            (_1M, 0, [token.address, weth.address], user, now(100), {from: user});
            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
            (_1M, 0, [token.address, weth.address], user, now(100), {from: user});
            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
            (_1M, 0, [token.address, weth.address], user, now(100), {from: user});
            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
            (_1M, 0, [token.address, weth.address], user, now(100), {from: user});
            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
            (_1M, 0, [token.address, weth.address], user, now(100), {from: user});
            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
            (_1M, 0, [token.address, weth.address], user, now(100), {from: user});
            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
            (_1M, 0, [token.address, weth.address], user, now(100), {from: user});
            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
            (_1M, 0, [token.address, weth.address], user, now(100), {from: user});
            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
            (_1M, 0, [token.address, weth.address], user, now(100), {from: user});
            await router.connect(USER).swapExactTokensForETHSupportingFeeOnTransferTokens
            (_1M, 0, [token.address, weth.address], user, now(100), {from: user});

        });

    });

    describe("Transfers", () => {
        it("Do 10 transfers of 100 each", async () => {
            await token.transfer(user, MINTED);
            await token.connect(USER).transfer(user1, CEM);
            await token.connect(USER).transfer(user1, CEM);
            await token.connect(USER).transfer(user1, CEM);
            await token.connect(USER).transfer(user1, CEM);
            // 4 transfer of 100 each, user must receive 91 each total of 364 (91*4=364)
            expect(fromWei(await token.balanceOf(user1))).to.be.equal('364.0');


            await token.connect(USER).transfer(user2, CEM);
            await token.connect(USER).transfer(user2, CEM);
            await token.connect(USER).transfer(user2, CEM);

            await token.connect(USER).transfer(user3, CEM);
            await token.connect(USER).transfer(user3, CEM);
            await token.connect(USER).transfer(user3, CEM);

            // dev fund should be 10 (1%*100)
            expect(fromWei(await token.balanceOf(await token.devFundWalletAddress()))).to.be.equal('10.0');

            await token.connect(USER1).transfer(user, ONE);
            await token.connect(USER2).transfer(user1, ONE);
            await token.connect(USER3).transfer(user2, ONE);
            await token.connect(USER1).transfer(user, ONE);
            await token.connect(USER2).transfer(user1, ONE);
            await token.connect(USER3).transfer(user2, ONE);
            await token.connect(USER1).transfer(user, ONE);
            await token.connect(USER2).transfer(user1, ONE);
            await token.connect(USER3).transfer(user2, ONE);
            await token.connect(USER1).transfer(user, ONE);
            await token.connect(USER2).transfer(user1, ONE);
            await token.connect(USER3).transfer(user2, ONE);
            await token.connect(USER1).transfer(user, ONE);
            await token.connect(USER2).transfer(user1, ONE);
            await token.connect(USER3).transfer(user2, ONE);
            await token.connect(USER1).transfer(user, ONE);
            await token.connect(USER2).transfer(user1, ONE);
            await token.connect(USER3).transfer(user2, ONE);
            await token.connect(USER1).transfer(user, ONE);
            await token.connect(USER2).transfer(user1, ONE);
            await token.connect(USER3).transfer(user2, ONE);
            await token.connect(USER1).transfer(user, ONE);
            await token.connect(USER2).transfer(user1, ONE);
            await token.connect(USER3).transfer(user2, ONE);

        });


        it("Do transfer and check balances", async () => {

            await token.transfer(user, CEM);
            await token.connect(USER).transfer(user1, CEM);

            const holderAddress: string = await token.holderAddress();
            const burnAddress: string = await token.burnAddress();
            const charityWalletAddress: string = await token.charityWalletAddress();
            const devFundWalletAddress: string = await token.devFundWalletAddress();
            const marketingFundWalletAddress: string = await token.marketingFundWalletAddress();
            const lotteryPotWalletAddress: string = await token.lotteryPotWalletAddress();

            const balanceOf_dev = await token.balanceOf(dev);
            const balanceOf_holderAddress = await token.balanceOf(holderAddress);
            const balanceOf_burnAddress = await token.balanceOf(burnAddress);
            const balanceOf_charityWalletAddress = await token.balanceOf(charityWalletAddress);
            const balanceOf_devFundWalletAddress = await token.balanceOf(devFundWalletAddress);
            const balanceOf_marketingFundWalletAddress = await token.balanceOf(marketingFundWalletAddress);
            const balanceOf_lotteryPotWalletAddress = await token.balanceOf(lotteryPotWalletAddress);

            // should be 999999999999900.999999999 because we transferred only 100
            expect(fromWei(balanceOf_dev)).to.be.equal('999999999999900.999999999');

            // should be 0 because we are no transferring to donation
            expect(fromWei(balanceOf_lotteryPotWalletAddress)).to.be.equal('0.5');

            // holder wallet should get 0.5% on each transfer
            expect(fromWei(balanceOf_holderAddress)).to.be.equal('0.5');

            // holder wallet should get 1% on each transfer
            expect(fromWei(balanceOf_burnAddress)).to.be.equal('1.0');

            // charity wallet should get 2% on each transfer
            expect(fromWei(balanceOf_charityWalletAddress)).to.be.equal('2.0');

            // dev wallet should get 1% on each transfer
            expect(fromWei(balanceOf_devFundWalletAddress)).to.be.equal('1.0');

            // market wallet should get 2% on each transfer
            expect(fromWei(balanceOf_marketingFundWalletAddress)).to.be.equal('2.0');

            // lottery wallet should get 0.5% on each transfer
            expect(fromWei(balanceOf_lotteryPotWalletAddress)).to.be.equal('0.5');

        });

    });

    describe("Loterry Tests", () => {

        it("transfer above limit ticket test", async () => {

            // enable holder lottery
            await token.setLottery1of1kEnabled(true);

            // the donation address, if we transfer to this address, we get a ticket
            const lotteryPotWalletAddress = await token.lotteryPotWalletAddress();

            // mininum transfer amount to get a transfer ticket: 1 (1_000_000_000) token
            const lotteryMinTicketValue = await token.lotteryMinTicketValue();
            expect(fromWei(lotteryMinTicketValue)).to.be.equal('1.0');

            // should not get a ticket, bellow limit.
            await token.transfer(user, toWei('0.1'));
            let lotteryTotalTicket = (await token.lotteryTotalTicket()).toString();
            expect(lotteryTotalTicket).to.be.equal('0'); // 0 = dead address

            // should get a ticket, above min limit and to donation
            await token.transfer(lotteryPotWalletAddress, toWei('1.1'));

            lotteryTotalTicket = (await token.lotteryTotalTicket()).toString();
            // we should have 1 valid user ticket
            expect(lotteryTotalTicket).to.be.equal('1');

            // ticket at 0 index should be ticket 1
            let loterryUserTickets = (await token.loterryUserTickets(dev));
            expect(loterryUserTickets[0].toString()).to.be.equal('0');
        });

        it("lottery1of1k", async () => {

            // enable holder lottery
            await token.setLottery1of1kEnabled(true);
            await token.setLottery1of1kDebug(false);

            // the donation address, if we transfer to this address, we get a ticket
            const lotteryPotWalletAddress = await token.lotteryPotWalletAddress();

            // populate users wallets:
            await token.transfer(user, toWei('100'));
            await token.transfer(user1, toWei('100'));
            await token.transfer(user2, toWei('100'));
            await token.transfer(user3, toWei('100'));

            // should get a ticket, above min limit and to donation

            await token.transfer(lotteryPotWalletAddress, toWei('1'));
            await token.connect(USER).transfer(lotteryPotWalletAddress, toWei('1'));
            await token.connect(USER1).transfer(lotteryPotWalletAddress, toWei('1'));
            await token.connect(USER2).transfer(lotteryPotWalletAddress, toWei('1'));
            await token.connect(USER3).transfer(lotteryPotWalletAddress, toWei('1'));
            await token.transfer(lotteryPotWalletAddress, toWei('1'));
            await token.transfer(lotteryPotWalletAddress, toWei('1'));
            await token.transfer(lotteryPotWalletAddress, toWei('1'));
            await token.transfer(lotteryPotWalletAddress, toWei('1'));
            await token.transfer(lotteryPotWalletAddress, toWei('1'));

            // lottery should be triggered at anytime above
            const lottery1of1kWinner = await token.lottery1of1kWinner();
            expect(lottery1of1kWinner).not.to.be.equal('0x0000000000000000000000000000000000000000');

            // populate users wallets:
            await token.transfer(user, toWei('10'));
            await token.transfer(user1, toWei('10'));
            await token.transfer(user2, toWei('10'));
            await token.transfer(user3, toWei('10'));

            // should get a ticket, above min limit and to donation

            await token.transfer(lotteryPotWalletAddress, toWei('1'));
            await token.connect(USER).transfer(lotteryPotWalletAddress, toWei('1'));
            await token.connect(USER1).transfer(lotteryPotWalletAddress, toWei('1'));
            await token.connect(USER2).transfer(lotteryPotWalletAddress, toWei('1'));
            await token.connect(USER3).transfer(lotteryPotWalletAddress, toWei('1'));
            await token.transfer(lotteryPotWalletAddress, toWei('1'));
            await token.transfer(lotteryPotWalletAddress, toWei('1'));
            await token.transfer(lotteryPotWalletAddress, toWei('1'));
            await token.transfer(lotteryPotWalletAddress, toWei('1'));
            await token.transfer(lotteryPotWalletAddress, toWei('1'));


        });

        it("lotteryHolders", async () => {

            await token.setLotteryHoldersEnabled(true);
            await token.setLotteryHoldersDebug(false);
            const lotteryHolderMinBalance = toWei('1000');
            // mass transfer to
            await token.transfer(user, toWei('10000'));

            await token.connect(USER).transfer(user1, lotteryHolderMinBalance);
            await token.connect(USER).transfer(user2, lotteryHolderMinBalance);
            await token.connect(USER).transfer(user3, lotteryHolderMinBalance);

            await token.connect(USER).transfer(dev, toWei('1'));
            await token.connect(USER1).transfer(dev, toWei('1'));
            await token.connect(USER2).transfer(dev, toWei('1'));
            await token.connect(USER).transfer(user1, lotteryHolderMinBalance);
            await token.connect(USER3).transfer(dev, toWei('1'));
            await token.connect(USER).transfer(dev, toWei('1'));
            await token.connect(USER1).transfer(dev, toWei('1'));
            await token.connect(USER).transfer(user1, lotteryHolderMinBalance);
            await token.connect(USER2).transfer(dev, toWei('1'));
            await token.connect(USER3).transfer(dev, toWei('1'));
            await token.connect(USER).transfer(dev, toWei('1'));
            await token.connect(USER).transfer(user1, lotteryHolderMinBalance);
            await token.connect(USER1).transfer(dev, toWei('1'));
            await token.connect(USER2).transfer(dev, toWei('1'));
            await token.connect(USER).transfer(user1, lotteryHolderMinBalance);
            await token.connect(USER3).transfer(dev, toWei('1'));


        });


    });

});
