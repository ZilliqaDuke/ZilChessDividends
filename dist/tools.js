"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMinHold = exports.screenEvents = exports.fetchTransfers = exports.sortEventsDB = exports.currentBalance = exports.currentDividends = exports.currentTimestamps = exports.zchBalances = void 0;
const zilliqa_1 = require("./zilliqa");
const crypto_1 = require("@zilliqa-js/crypto");
const fromDaysToMilliseconds = (nDays) => {
    return nDays * 24 * 60 * 60 * 1000;
};
const fromTStoDate = (timestamp) => {
    let dateobj = new Date(timestamp);
    return dateobj.toLocaleString();
};
const zchBalances = () => __awaiter(void 0, void 0, void 0, function* () {
    let rawZCHBalances;
    let zchHolders = [];
    let base16Accounts;
    let bech32Accounts;
    let stringZCHValues;
    let zchValues;
    let zchContract = zilliqa_1.zilliqa.contracts.at("0x81cc224018333aA36baDe62786179b888C38e9dd");
    try {
        rawZCHBalances = yield zchContract.getSubState('balances');
        base16Accounts = Object.keys(rawZCHBalances.balances);
        stringZCHValues = Object.values(rawZCHBalances.balances);
        bech32Accounts = base16Accounts.map(x => (0, crypto_1.toBech32Address)(x));
        zchValues = stringZCHValues.map(x => parseInt(x));
        for (let i = 0; i < bech32Accounts.length; i++) {
            zchHolders.push({ 'account': bech32Accounts[i], 'zchBalance': zchValues[i], 'dividends': undefined });
        }
        return zchHolders;
    }
    catch (err) {
        console.log(err);
    }
});
exports.zchBalances = zchBalances;
const currentTimestamps = () => __awaiter(void 0, void 0, void 0, function* () {
    let txBlock = yield zilliqa_1.zilliqa.blockchain.getLatestTxBlock();
    return txBlock;
});
exports.currentTimestamps = currentTimestamps;
const currentDividends = () => __awaiter(void 0, void 0, void 0, function* () {
    let balance = yield zilliqa_1.zilliqa.blockchain.getBalance("0x4F3B81Ac6533F2716b94B38d8e13cbd99464cfF6");
    return balance;
});
exports.currentDividends = currentDividends;
const currentBalance = (tokenContractBase16, checkedAccountBase16) => __awaiter(void 0, void 0, void 0, function* () {
    let balances;
    let currentBalance;
    let contract = zilliqa_1.zilliqa.contracts.at(tokenContractBase16);
    let checkedAccount = checkedAccountBase16.toLowerCase();
    try {
        balances = yield contract.getSubState('balances');
        currentBalance = parseInt(balances.balances[checkedAccount]);
        return currentBalance;
    }
    catch (err) {
        console.log(err);
    }
});
exports.currentBalance = currentBalance;
const sortEventsDB = (eventsDB) => {
    let compare = (a, b) => {
        if (a.timestamp < b.timestamp) {
            return 1;
        }
        if (a.timestamp > b.timestamp) {
            return -1;
        }
        return 0;
    };
    return eventsDB.sort(compare);
};
exports.sortEventsDB = sortEventsDB;
const fetchTransfers = (api_url, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let firstResponse = yield fetch(api_url, options);
        let secondResponse = yield firstResponse.text();
        return JSON.parse(secondResponse);
    }
    catch (err) {
        console.log(err);
    }
});
exports.fetchTransfers = fetchTransfers;
const screenEvents = (tokenContractBase16, eventTx, currentTimestamp, nDays, checkedAccountBase16) => {
    let startTimestamp = currentTimestamp - fromDaysToMilliseconds(nDays);
    if (eventTx.receiptSuccess) {
        if (eventTx.timestamp >= startTimestamp) {
            for (let event of eventTx.events) {
                if (event.name == "TransferSuccess" || "TransferFromSuccess") {
                    if (event.address == (0, crypto_1.toBech32Address)(tokenContractBase16)) {
                        if (event.params.sender == (0, crypto_1.toBech32Address)(checkedAccountBase16) || event.params.recipient == (0, crypto_1.toBech32Address)(checkedAccountBase16)) {
                            return { 'event': event.name, 'tokenContract': event.address, 'sender': event.params.sender, 'recipient': event.params.recipient, 'amount': parseInt(event.params.amount), 'timestamp': eventTx.timestamp, 'datetime': fromTStoDate(eventTx.timestamp) };
                        }
                    }
                }
            }
        }
    }
};
exports.screenEvents = screenEvents;
const checkMinHold = (monthBalances, minHold) => {
    try {
        for (let balance of monthBalances) {
            if (balance < minHold) {
                return false;
            }
        }
        return true;
    }
    catch (err) {
        console.log(err);
    }
};
exports.checkMinHold = checkMinHold;
//# sourceMappingURL=tools.js.map