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
const tools_1 = require("./tools");
const crypto_1 = require("@zilliqa-js/crypto");
const options = {
    headers: {
        'X-APIKEY': 'APIKEY_VIEWBLOCK'
    }
};
const hasMinHoldnDays = (tokenContractBase16, nDays, checkedAccountBase16, minHold) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let api_url;
        let events;
        let eventsDB = [];
        let monthBalances = [];
        let currentTimestamp = Date.now();
        let eventTypes = ["TransferSuccess", "TransferFromSuccess"];
        let balance = yield (0, tools_1.currentBalance)(tokenContractBase16, checkedAccountBase16);
        monthBalances.push(balance);
        for (let eventType of eventTypes) {
            for (let i = 0; i < 20; i++) {
                api_url = `https://api.viewblock.io/v1/zilliqa/contracts/${tokenContractBase16.slice(2)}/events/${eventType}?page=${i + 1}`;
                events = yield (0, tools_1.fetchTransfers)(api_url, options);
                try {
                    for (let j = 0; j < 25; j++) {
                        if (typeof (events.txs) != 'undefined' && typeof ((0, tools_1.screenEvents)(tokenContractBase16, events.txs[j], currentTimestamp, nDays, checkedAccountBase16)) != 'undefined') {
                            eventsDB.push((0, tools_1.screenEvents)(tokenContractBase16, events.txs[j], currentTimestamp, nDays, checkedAccountBase16));
                        }
                    }
                }
                catch (err) {
                    console.log(err);
                    events = yield (0, tools_1.fetchTransfers)(api_url, options);
                    for (let j = 0; j < 25; j++) {
                        if (typeof (events.txs) != 'undefined' && typeof ((0, tools_1.screenEvents)(tokenContractBase16, events.txs[j], currentTimestamp, nDays, checkedAccountBase16)) != 'undefined') {
                            eventsDB.push((0, tools_1.screenEvents)(tokenContractBase16, events.txs[j], currentTimestamp, nDays, checkedAccountBase16));
                        }
                    }
                }
            }
        }
        eventsDB = (0, tools_1.sortEventsDB)(eventsDB);
        for (let eventRecord of eventsDB) {
            if (eventRecord.sender == (0, crypto_1.toBech32Address)(checkedAccountBase16)) {
                balance = balance + eventRecord.amount;
                monthBalances.push(balance);
            }
            if (eventRecord.recipient == (0, crypto_1.toBech32Address)(checkedAccountBase16)) {
                balance = balance - eventRecord.amount;
                monthBalances.push(balance);
            }
        }
        process.stdout.write(`\t ${(0, crypto_1.toBech32Address)(checkedAccountBase16)}: `);
        return (0, tools_1.checkMinHold)(monthBalances, minHold);
    }
    catch (err) {
        console.log(err);
    }
});
const getReport = (minZCHHold, minREDCHold) => __awaiter(void 0, void 0, void 0, function* () {
    let report = { 'timestamp': undefined, 'txBlock': undefined, 'totDividends': undefined, 'eligibleHolders': undefined };
    let redcBalance;
    try {
        let timeInfo = yield (0, tools_1.currentTimestamps)();
        let divInfo = yield (0, tools_1.currentDividends)();
        let zchBal = yield (0, tools_1.zchBalances)();
        let zchBalScreened = [];
        zchBal = zchBal.filter(x => x.zchBalance >= minZCHHold);
        for (let item of zchBal) {
            redcBalance = yield (0, tools_1.currentBalance)("0xaCb721d989c095c64A24d16DfD23b08D738e2552", (0, crypto_1.fromBech32Address)(item.account));
            if (redcBalance >= minREDCHold)
                zchBalScreened.push(item);
        }
        report.timestamp = timeInfo.result.header.Timestamp;
        report.txBlock = timeInfo.result.header.BlockNum;
        report.totDividends = parseInt(divInfo.result.balance);
        report.eligibleHolders = zchBalScreened;
        return report;
    }
    catch (err) {
        console.log(err);
    }
});
const getHolderDividends = (report) => {
    let quotes = report.eligibleHolders.map(x => x.zchBalance);
    let tot = quotes.reduce((a, b) => a + b);
    let shares = quotes.map(x => x / tot);
    for (let i = 0; i < report.eligibleHolders.length; i++) {
        report.eligibleHolders[i].dividends = Math.trunc(shares[i] * report.totDividends);
    }
    return report;
};
exports.hasMinHoldnDays = hasMinHoldnDays;
exports.getReport = getReport;
exports.getHolderDividends = getHolderDividends;
//# sourceMappingURL=methods.js.map