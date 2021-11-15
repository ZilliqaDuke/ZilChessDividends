import { zilliqa } from './zilliqa';
import { toBech32Address } from '@zilliqa-js/crypto';

type Opt = {
    headers: {
        'X-APIKEY': string
    }
}

export type Holder = {
    'account': string,
    'zchBalance': number,
    'dividends': number
}

type TransferEvent = {
    'event': string,
    'tokenContract': string,
    'sender': string,
    'recipient': string,
    'amount': number,
    'timestamp': number,
    'datetime': string
}

type ViewBlockEventTx = {
    'hash': string,
    'blockHeight': number,
    'from': string,
    'to': string,
    'value': string,
    'fee': string,
    'timestamp': number,
    'signature': string,
    'direction': string,
    'nonce': number,
    'receiptSuccess': boolean,
    'data': string,
    'internalTransfer': [],
    'events':
        {
            'address': string,
            'name': string,
            'details': string,
            'params':
                {
                    'sender': string,
                    'recipient': string,
                    'amount': string
                }
        }[]
}

const fromDaysToMilliseconds = (nDays: number) => {
    return nDays * 24 * 60 * 60 * 1000;
}

const fromTStoDate = (timestamp: number) => {
    let dateobj = new Date(timestamp);
    return dateobj.toLocaleString();
}

export const zchBalances = async() => {
    let rawZCHBalances;
    let zchHolders: Holder[] = [];
    let base16Accounts: string[];
    let bech32Accounts: string[];
    let stringZCHValues: string[];
    let zchValues: number[];
    let zchContract = zilliqa.contracts.at("0x81cc224018333aA36baDe62786179b888C38e9dd");
    try {
        rawZCHBalances = await zchContract.getSubState('balances');
        base16Accounts = Object.keys(rawZCHBalances.balances);
        stringZCHValues = Object.values(rawZCHBalances.balances);
        bech32Accounts = base16Accounts.map(x => toBech32Address(x));
        zchValues = stringZCHValues.map(x => parseInt(x));
        for (let i = 0; i < bech32Accounts.length; i++) {
            zchHolders.push({'account': bech32Accounts[i], 'zchBalance': zchValues[i], 'dividends': undefined});
        }
        return zchHolders;
    } catch (err) {
        console.log(err);
    }
}

export const currentTimestamps = async() => {
    let txBlock = await zilliqa.blockchain.getLatestTxBlock();
    return txBlock;
}

export const currentDividends = async() => {
    let balance = await zilliqa.blockchain.getBalance("0x4F3B81Ac6533F2716b94B38d8e13cbd99464cfF6");
    return balance;
}

export const currentBalance = async(tokenContractBase16: string, checkedAccountBase16: string) => {
    let balances;
    let currentBalance;
    let contract = zilliqa.contracts.at(tokenContractBase16);
    let checkedAccount = checkedAccountBase16.toLowerCase();
    try {
        balances = await contract.getSubState('balances');
        currentBalance = parseInt(balances.balances[checkedAccount]);
        return currentBalance;
    } catch (err) {
        console.log(err);
    }
}

export const sortEventsDB = (eventsDB: TransferEvent[]) => {
    let compare = (a: TransferEvent, b: TransferEvent) => {
        if (a.timestamp < b.timestamp) {
            return 1;
        }
        if (a.timestamp > b.timestamp) {
            return -1;
        }
        return 0;
    }
    return eventsDB.sort(compare);
}

export const fetchTransfers = async (api_url: string, options: Opt) => {
    try {
        let firstResponse = await fetch(api_url, options);
        let secondResponse = await firstResponse.text();
        return JSON.parse(secondResponse);
    } catch (err) {
        console.log(err);
    }
}

export const screenEvents = (tokenContractBase16: string, eventTx: ViewBlockEventTx, currentTimestamp: number, nDays: number, checkedAccountBase16: string) => {
    let startTimestamp = currentTimestamp - fromDaysToMilliseconds(nDays);
    if (eventTx.receiptSuccess) {
        if (eventTx.timestamp >= startTimestamp) {
            for (let event of eventTx.events) {
                if (event.name == "TransferSuccess" || "TransferFromSuccess") {
                    if (event.address == toBech32Address(tokenContractBase16)) {
                        if (event.params.sender == toBech32Address(checkedAccountBase16) || event.params.recipient == toBech32Address(checkedAccountBase16)) {
                            return {'event': event.name, 'tokenContract': event.address, 'sender': event.params.sender, 'recipient': event.params.recipient, 'amount': parseInt(event.params.amount), 'timestamp': eventTx.timestamp, 'datetime': fromTStoDate(eventTx.timestamp)};
                        }
                    }
                }
            }
        }
    }
}

export const checkMinHold = (monthBalances: number[], minHold: number) => {
    try {
        for (let balance of monthBalances) {
            if (balance < minHold) {
                return false;
            }
        }
        return true;
    } catch (err) {
        console.log(err);
    }
}