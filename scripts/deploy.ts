import { ethers } from "hardhat";
import { linkMumbai, linkSepolia, routerMumbai, routerSepolia, saveContractAddress } from "./utils";
import dotenv from "dotenv";
dotenv.config();

const {
	DEPLOYER_PRIVATE_KEY,
	SEPOLIA_RPC_URL,
	MUMBAI_RPC_URL,
} = process.env;

export async function deployCCIP() {
	const rpcSepolia = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
	const rpcMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);

	// Deployment - Sepolia
	var signerSepolia = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcSepolia);
	var FactorySepolia = await ethers.getContractFactory("Overswap", signerSepolia);
	var OverswapSepolia = await FactorySepolia.deploy(routerSepolia, linkSepolia);
	saveContractAddress("OVERSWAP_SEPOLIA", OverswapSepolia.address);
	console.log(
		"\nContract Overswap - Sepolia \nDeployed to %s \nAt Tx %s\n",
		OverswapSepolia.address,
		OverswapSepolia.deployTransaction.hash,
	);
	
	// Deployment - Mumbai
	var signerMumbai = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcMumbai);
	var FactoryMumbai = await ethers.getContractFactory("Overswap", signerMumbai);
	var OverswapMumbai = await FactoryMumbai.deploy(routerMumbai, linkMumbai);
	saveContractAddress("OVERSWAP_MUMBAI", OverswapMumbai.address);
	console.log(
		"\nContract Overswap - Mumbai \nDeployed to %s \nAt Tx %s\n",
		OverswapMumbai.address,
		OverswapMumbai.deployTransaction.hash,
	);

	return [OverswapSepolia, OverswapMumbai]
}

deployCCIP().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
