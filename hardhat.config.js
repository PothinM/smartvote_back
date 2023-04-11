require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-gas-reporter");
//
require('dotenv').config();

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
const ALCHEMY_API_KEY = process.env.STAGING_ALCHEMY_KEY;

const MUMBAI_API_KEY = process.env.STAGING_MUMBAI_KEY;

// Replace this private key with your Goerli account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const GOERLI_PRIVATE_KEY = process.env.PRIVATE_KEY;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
      goerli: {
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
        url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
        accounts: [GOERLI_PRIVATE_KEY]
      },
      mumbai: {
        url: `https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_API_KEY}`,
        accounts: [GOERLI_PRIVATE_KEY]
      }

    }
};