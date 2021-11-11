# ZilChessDividends
NodeJS application for creating the monthly dividend report of the decentralized platform zilchill.com/chess

## Requirements
* ViewBlock API key (see https://viewblock.io/) stored in the .env file as APIKEY_VIEWBLOCK=xxxxxxxxxx
* nodeJS >= 12.16.3
* libraries included in package.json must be installed

## Instructions
* set in the index.js file the minimum hold of $ZCH and $REDC to be verified (minZCHHold, minREDCHold)
* set in the index.js file the number of days (nDays) to look backwards for the minimum hold verification
* run from the command line ```$>node index.js```

## Note
The amount of dividends is expressed in Qa (1 Qa = 10^-12 ZIL)

## Output
dividendReport_YYYY-MM-DD.json

Example:
```
{
  timestamp: '1636617257614618',
  txBlock: '1577064',
  totDividends: 136000000000000,
  eligibleHolders: [
    {
      account: 'zil19ej5s5wl8sw8z6u8l3dfcn7kkspsqrgngkksdn',
      zchBalance: 11336890576,
      dividends: 8110394189988
    },
    {
      account: 'zil182zkq97dtzgqpku6dc33g34xwv9rhr7ufm0lvw',
      zchBalance: 2043677353,
      dividends: 1462043654639
    },
    {
      account: 'zil18w846fjddtad06yltp2usvshxp84569gkg65cx',
      zchBalance: 55200172181,
      dividends: 39490118806552
    },
    {
      account: 'zil1g3vwzveq4yyvz3lmyt30z6kms9tq8jzkp54n24',
      zchBalance: 1500000000,
      dividends: 1073097707296
    },
    {
      account: 'zil1wm5zg0h7zfwga4g6q6ae9uapw677cyektwnjx7',
      zchBalance: 2808955240,
      dividends: 2009522285295
    },
    {
      account: 'zil14rdmwlcxqvm2ccyx8qxpjl6zg2spnppqjeyy79',
      zchBalance: 14000000000,
      dividends: 10015578601438
    },
    {
      account: 'zil1hgg7k77vpgpwj3av7q7vv5dl4uvunmqqjzpv2w',
      zchBalance: 84465136978,
      dividends: 60426229891744
    },
    {
      account: 'zil1cfsed6c43mcj6dpj9qkdas427dxkfln7n93vm7',
      zchBalance: 3534493156,
      dividends: 2528571001440
    },
    {
      account: 'zil1mzsa2wpesslu599j8scamajj4a6u5tqsrny2k8',
      zchBalance: 6117479884,
      dividends: 4376435758637
    },
    {
      account: 'zil1udtng2x2z82dqumq6uflwekh0ctu0nqay6nlcx',
      zchBalance: 1478574372,
      dividends: 1057769845774
    },
    {
      account: 'zil17rgw66lsk78npxxq2g2gp82gq2xxatnpanv46t',
      zchBalance: 2050894825,
      dividends: 1467207023076
    },
    {
      account: 'zil17eexav4drhp4zmq2x7r4hns0ar2mg48w5q6lww',
      zchBalance: 5567570232,
      dividends: 3983031234116
    }
  ]
}

```
