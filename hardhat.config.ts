import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import '@typechain/hardhat';

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking:{
        url: "https://rpc.apex.proofofplay.com",
        blockNumber: 2403280,
      }
    },
  }
};

export default config;
