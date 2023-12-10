import { ethers } from "hardhat";

const {
    DEPLOYER_PRIVATE_KEY,
    SEPOLIA_RPC_URL,
    MUMBAI_RPC_URL,
    
} = process.env;

async function main() {
    
    // Deployed contracts
    const overswapSepolia = "0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59";
    const overswapMumbai = "0x1035cabc275068e0f4b745a29cedf38e13af41b1";
    
    const rpcSepolia = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
	const rpcMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);

    // Get the Signers
    var signerSepolia = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcSepolia);
    var signerMumbai = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcMumbai);

    // Get the contracts

}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});