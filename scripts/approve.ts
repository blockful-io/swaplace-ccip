import { ethers } from "hardhat";
import dotenv from "dotenv";
import { linkSepolia, linkMumbai, getSigners } from "./utils";
dotenv.config();

const {
    OVERSWAP_SEPOLIA,
    OVERSWAP_MUMBAI,
} = process.env;

export async function approveLinkSignerChain(signer: any, amount: any) {
    let linkTokenAddr;
    let spenderAddr;
    const signerChain = await signer.getChainId();

    if(signerChain == 11155111) {
        linkTokenAddr = linkSepolia;
        spenderAddr = OVERSWAP_SEPOLIA as string;
    } else if(signerChain == 80001) {
        linkTokenAddr = linkMumbai;
        spenderAddr = OVERSWAP_MUMBAI as string;
    } else {
        throw new Error("Invalid chain for Signer, only Sepolia and Mumbai are supported");
    }

    // Connect to the LINK token contract determined by the signer network
    const Link = new ethers.Contract(
        linkTokenAddr,
        ["function approve(address spender, uint256 amount) external returns (bool)"],
        signer
    );
        
    // Approve Link to be spent by user address
    await Link.connect(signer).approve(
        spenderAddr, 
        amount,
        {
            gasLimit: 1000000,
        }
    );
    console.log("Approved %s LINK for %s", amount, spenderAddr);
}

export async function main() {
    const [signerSepolia, signerMumbai] = await getSigners();
    await approveLinkSignerChain(signerSepolia, ethers.utils.parseEther("5"));
    await approveLinkSignerChain(signerMumbai, ethers.utils.parseEther("5"));
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});