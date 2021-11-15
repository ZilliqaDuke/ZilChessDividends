require('dotenv').config();
const methods = require("./dist/methods");
const fs = require('fs');
const { fromBech32Address } = require('@zilliqa-js/crypto');
const zchContractAddressBase16 = "0x81cc224018333aA36baDe62786179b888C38e9dd";
const rdcContractAddressBase16 = "0xaCb721d989c095c64A24d16DfD23b08D738e2552";

const main = async (minZCHHold, minREDCHold, nDays) => {
    let report;
    let reportJSON;
    let scrEligibleHolders = [];
    let response;
    let today = new Date();
    let date = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
    try {
        // fetch the $ZCH holders report
        console.log();
        process.stdout.write(`1. Fetching $ZCH holders report, please wait...`);
        report = await methods.getReport(minZCHHold, minREDCHold);
        process.stdout.write(`done`);
        console.log();
        console.log();
        console.log();

        // screen the accounts which held min amount of $REDC in the latest n days
        console.log(`2. Screening accounts which held min ${parseInt(minREDCHold / 10**9)} $REDC in the latest ${nDays} days...`);
        console.log();
        for (let item of report.eligibleHolders) {
            response = await methods.hasMinHoldnDays(rdcContractAddressBase16, nDays, fromBech32Address(item.account), minREDCHold);
            process.stdout.write(`${response}`);
            console.log();
            if (response) scrEligibleHolders.push(item);
        }
        report.eligibleHolders = scrEligibleHolders;
        console.log();
        console.log();
        console.log();

        // screen the accounts which held min amount of $ZCH in the latest n days
        scrEligibleHolders = [];
        console.log(`3. Screening accounts which held min ${parseInt(minZCHHold / 10**6)} $ZCH in the latest ${nDays} days...`);
        console.log();
        for (let item of report.eligibleHolders) {
            response = await methods.hasMinHoldnDays(zchContractAddressBase16, nDays, fromBech32Address(item.account), minZCHHold);
            process.stdout.write(`${response}`);
            console.log();
            if (response) scrEligibleHolders.push(item);
        }
        report.eligibleHolders = scrEligibleHolders;
        console.log();
        console.log();
        console.log();

        // calculate dividends
        process.stdout.write(`4. Calculating dividends...`);
        report = methods.getHolderDividends(report);
        process.stdout.write(`done`);
        console.log();
        console.log();
        console.log();

        // save results in dividendReport.json
        process.stdout.write(`5. Saving JSON file...`);
        reportJSON = JSON.stringify(report);
        fs.writeFile(`dividendReport_${date}.json`, reportJSON, function(err) {
            if (err) {
                console.log(err);
            };
        });
        process.stdout.write(`done`);
        console.log();
        console.log();
        console.log();

    } catch (err) {
        console.log(err);
    }
}

var minZCHHold = 1000 * 10**6;
var minREDCHold = 100 * 10**9;
var nDays = 30;

main(minZCHHold, minREDCHold, nDays);
