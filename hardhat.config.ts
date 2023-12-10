import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const {
	DEPLOYER_PRIVATE_KEY,
	SEPOLIA_RPC_URL,
	MUMBAI_RPC_URL,
	ETHERSCAN_API_KEY,
	POLYGONSCAN_API_KEY,
} = process.env;

const config: HardhatUserConfig = {
	solidity: "0.8.19",
	// etherscan: {
	// 	apiKey: {
	// 		etherscan: `${ETHERSCAN_API_KEY}`,
	// 		polygonscan: `${POLYGONSCAN_API_KEY}`,
	// 	},
	// },
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
		mumbai: {
			url: `${MUMBAI_RPC_URL}`,
			accounts: [`${DEPLOYER_PRIVATE_KEY}`],
		},
	},
	defaultNetwork: "hardhat",
	gasReporter: {
		enabled: true,
	}
};

export default config;
