import { zchBalances, currentBalance, currentTimestamps, fetchTransfers, screenEvents, sortEventsDB, checkMinHold , Holder, currentDividends } from './tools';
import { fromBech32Address, toBech32Address } from '@zilliqa-js/crypto';

type Report = {
    'timestamp': string,
    'txBlock': string,
    'totDividends': number,
    'eligibleHolders': Holder[]
}

const options = {
    headers: {
        'X-APIKEY': process.env.APIKEY_VIEWBLOCK
    }
}

const hasMinHoldnDays = async (tokenContractBase16: string, nDays: number, checkedAccountBase16: string, minHold: number) => {
    try {
        let api_url;
        let events;
        let eventsDB = [];
        let monthBalances = [];
        let currentTimestamp = Date.now();
        let eventTypes = ["TransferSuccess", "TransferFromSuccess"];
        let balance = await currentBalance(tokenContractBase16, checkedAccountBase16);
        monthBalances.push(balance);
        for (let eventType of eventTypes) {
            for (let i = 0; i < 20; i++) {
                api_url = `https://api.viewblock.io/v1/zilliqa/contracts/${tokenContractBase16.slice(2)}/events/${eventType}?page=${i+1}`;
                events = await fetchTransfers(api_url, options);
                try {
                    for (let j = 0; j < 25; j++) {
                        if (typeof(events.txs) != 'undefined' && typeof(screenEvents(tokenContractBase16, events.txs[j], currentTimestamp, nDays, checkedAccountBase16)) != 'undefined') {
                            eventsDB.push(screenEvents(tokenContractBase16, events.txs[j], currentTimestamp, nDays, checkedAccountBase16));
                        }
                    }
                } catch (err) {
                    console.log(err);
                    events = await fetchTransfers(api_url, options);
                    for (let j = 0; j < 25; j++) {
                        if (typeof(events.txs) != 'undefined' && typeof(screenEvents(tokenContractBase16, events.txs[j], currentTimestamp, nDays, checkedAccountBase16)) != 'undefined') {
                            eventsDB.push(screenEvents(tokenContractBase16, events.txs[j], currentTimestamp, nDays, checkedAccountBase16));
                        }
                    }
                }
            }
        }
        eventsDB = sortEventsDB(eventsDB);
        for (let eventRecord of eventsDB) {
            if (eventRecord.sender == toBech32Address(checkedAccountBase16)) {
                balance = balance + eventRecord.amount;
                monthBalances.push(balance);
            }
            if (eventRecord.recipient == toBech32Address(checkedAccountBase16)) {
                balance = balance - eventRecord.amount;
                monthBalances.push(balance);
            }
        }
        process.stdout.write(`\t ${toBech32Address(checkedAccountBase16)}: `);
        return checkMinHold(monthBalances, minHold);
    } catch (err) {
        console.log(err);
    }
}

const getReport = async (minZCHHold: number, minREDCHold: number) => {
    let report: Report = {'timestamp': undefined, 'txBlock': undefined, 'totDividends': undefined, 'eligibleHolders': undefined};
    let redcBalance;
    try {
        let timeInfo = await currentTimestamps();
        let divInfo = await currentDividends();
        let zchBal = await zchBalances();
        let zchBalScreened = [];
        zchBal = zchBal.filter(x => x.zchBalance >= minZCHHold);
        for (let item of zchBal) {
            redcBalance = await currentBalance("0xaCb721d989c095c64A24d16DfD23b08D738e2552", fromBech32Address(item.account));
            if (redcBalance >= minREDCHold) zchBalScreened.push(item);
        }
        report.timestamp = timeInfo.result.header.Timestamp;
        report.txBlock = timeInfo.result.header.BlockNum;
        report.totDividends = parseInt(divInfo.result.balance);
        report.eligibleHolders = zchBalScreened;
        return report;
    } catch (err) {
        console.log(err);
    }
}

const getHolderDividends = (report: Report) => {
    let quotes = report.eligibleHolders.map(x => x.zchBalance);
    let tot = quotes.reduce((a, b) => a + b);
    let shares = quotes.map(x => x / tot);
    for (let i = 0; i < report.eligibleHolders.length; i++) {
        report.eligibleHolders[i].dividends = Math.trunc(shares[i] * report.totDividends);
    }
    return report;
}

exports.hasMinHoldnDays = hasMinHoldnDays;
exports.getReport = getReport;
exports.getHolderDividends = getHolderDividends;
