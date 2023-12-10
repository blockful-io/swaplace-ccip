import { ethers } from "hardhat";
import { destinationChainMumbai, destinationChainSepolia, getSigners } from "./utils";
import dotenv from "dotenv";
dotenv.config();

const {
    OVERSWAP_SEPOLIA,
    OVERSWAP_MUMBAI,
} = process.env;

export async function allowlistDestinationChain() {
    const [signerSepolia, signerMumbai] = await getSigners();
    const OverswapSepolia = await ethers.getContractAt("Overswap", OVERSWAP_SEPOLIA as string, signerSepolia);
    const OverswapMumbai = await ethers.getContractAt("Overswap", OVERSWAP_MUMBAI as string, signerMumbai);

    // Set allowlists for the destination chains
    // The destination chain should be the oposite of the chain is being setted
    // Meaning that if the destination chain is Mumbai, the allowlist should be setted on Sepolia
    await OverswapSepolia.allowlistDestinationChain(destinationChainSepolia, true);
    await OverswapMumbai.allowlistDestinationChain(destinationChainMumbai, true);
    console.log("Allowlisted Destination Chains");
}

allowlistDestinationChain().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});