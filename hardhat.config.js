// 统一使用 CommonJS 语法
require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
require("./task");


// 加载环境变量
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PRIVATE_KEY1 = process.env.PRIVATE_KEY1;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY,PRIVATE_KEY1],
      chainId: 11155111,
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  }
};