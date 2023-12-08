import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const {
	DEPLOYER_PRIVATE_KEY,
	SEPOLIA_RPC_URL,
	ETHERSCAN_API_KEY
} = process.env;

const config: HardhatUserConfig = {
	solidity: "0.8.19",
	etherscan: {
		apiKey: `${ETHERSCAN_API_KEY}`,
	},
	networks: {
		/**
		 * @dev Testnets
		 */
		sepolia: {
			url: `${SEPOLIA_RPC_URL}`,
			accounts: [`${DEPLOYER_PRIVATE_KEY}`],
		},
	},
	defaultNetwork: "hardhat",
	gasReporter: {
		enabled: true,
	}
};

export default config;
