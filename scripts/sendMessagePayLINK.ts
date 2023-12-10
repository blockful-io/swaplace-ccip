import { ethers } from "hardhat";
import dotenv from "dotenv";
import { destinationChainSepolia, destinationChainMumbai, getSigners } from "./utils";
import { abi } from "../artifacts/contracts/Overswap.sol/Overswap.json";
dotenv.config();

const {
	OVERSWAP_SEPOLIA,
	OVERSWAP_MUMBAI,
} = process.env;

export async function sendMessagePayLINK(signer: any, data: any) {
    const signerChain = await signer.getChainId();

    // Connect to the Overswap contract determined by the signer network
    const Overswap = new ethers.Contract(
        signerChain == 11155111 ? OVERSWAP_SEPOLIA as string : OVERSWAP_MUMBAI as string,
        abi,
        signer
    );

    // Send CCIP Message
    var tx = await Overswap.sendMessagePayLINK(
        signerChain == 11155111 ? destinationChainMumbai: destinationChainSepolia,
        signerChain == 11155111 ? OVERSWAP_MUMBAI as string : OVERSWAP_SEPOLIA as string,
        data,
        { 
            gasLimit: 1000000
        }
    )
    const receipt = await tx.wait();
    console.log(
        "\nSent CCIP Message \nTx %s\n",
        receipt.transactionHash,
    );
}

export async function main() {
    const [signerSepolia, signerMumbai] = await getSigners();
    await sendMessagePayLINK(signerSepolia, "Hello Mumbai!");
    await sendMessagePayLINK(signerMumbai, "Hello Sepolia!");
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
