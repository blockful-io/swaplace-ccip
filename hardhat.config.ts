import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const {
  DEPLOYER_PRIVATE_KEY,
  SEPOLIA_RPC_URL,
  MUMBAI_RPC_URL,
  BSC_TESTNET_RPC_URL,
  FUJI_RPC_URL,
  BASE_GOERLI_RPC_URL,
  OP_GOERLI_RPC_URL,
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
  },
  networks: {
    /**
     * @dev Testnets
     */
    sepolia: {
      url: `${SEPOLIA_RPC_URL}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`],
    },
    mumbai: {
      url: `${MUMBAI_RPC_URL}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`],
    },
    bnb: {
      url: `${BSC_TESTNET_RPC_URL}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`],
    },
    fuji: {
      url: `${FUJI_RPC_URL}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`],
    },
    base: {
      url: `${BASE_GOERLI_RPC_URL}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`],
    },
    optimism: {
      url: `${OP_GOERLI_RPC_URL}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`],
    },
  },
  defaultNetwork: "hardhat",
  gasReporter: {
    enabled: true,
  },
};

export default config;
