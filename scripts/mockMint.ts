import { ethers } from "hardhat";
import { getSigners } from "./utils";
import dotenv from "dotenv";
dotenv.config();

const {
    ERC721_SEPOLIA,
    ERC721_MUMBAI,
} = process.env;

export async function mintMockTokens(signer: any, tokenAmountOrId: any) {
    let mockTokenAddr;
    const signerChain = await signer.getChainId();

    if(signerChain == 11155111) {
        mockTokenAddr = ERC721_SEPOLIA as string;
    } else if(signerChain == 80001) {
        mockTokenAddr = ERC721_MUMBAI as string;
    } else {
        throw new Error("Invalid chain for Signer, only Sepolia and Mumbai are supported");
    }

    // Connect to the ERC721 token contract determined by the signer network
    const MockERC721 = new ethers.Contract(
        mockTokenAddr,
        ["function mintTo(address receiver, uint256 tokenId) public"],
        signer
    );
        
    // Approve ERC721 to be spent by user address
    await MockERC721.connect(signer).mintTo(
        signer.address, 
        tokenAmountOrId,
        {
            gasLimit: 1000000,
        }
    );
    console.log("Minted ID %s MockERC721 for %s", tokenAmountOrId, signer.address);

}

export async function main() {
    const [signerSepolia, signerMumbai] = await getSigners();
    await mintMockTokens(signerSepolia, 1);
    await mintMockTokens(signerMumbai, 1);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});