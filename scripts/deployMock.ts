import { ethers } from "hardhat";
import { getSigners, saveContractAddress } from "./utils";

export async function deployMock721() {
    const [signerSepolia, signerMumbai] = await getSigners();
    
    var Factory = await ethers.getContractFactory("MockERC721", signerSepolia);
    const ERC721Sepolia = await Factory.deploy();
    saveContractAddress("ERC721_SEPOLIA", ERC721Sepolia.address);
    console.log("Deployed Mock ERC721 in Sepolia");

    var Factory = await ethers.getContractFactory("MockERC721", signerMumbai);
    const ERC721Mumbai = await Factory.deploy();
    saveContractAddress("ERC721_MUMBAI", ERC721Mumbai.address);
    console.log("Deployed Mock ERC721 in Mumbai");

	return [ERC721Sepolia, ERC721Mumbai]
}

deployMock721().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
