# ZilChessDividends
NodeJS application for fetching the monthly dividend report of the decentralized platform zilchill.com/chess

## Requirements
* ViewBlock API key (see https://viewblock.io/) stored in the .env file as APIKEY_VIEWBLOCK=xxxxxxxxxx
* nodeJS >= 12.16.3

## Instructions
* set the minimum hold of $ZCH and $REDC to be verified (zchMinHold, redcMinHold) in the index.js file
* set the number of days (nDays) to look backwards for the minimum hold verification in the index.js file
* run 
