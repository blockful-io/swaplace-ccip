import { ethers } from "hardhat";
import dotenv from "dotenv";
const fs = require("fs");
const path = require("path");
dotenv.config();

const { DEPLOYER_PRIVATE_KEY, SEPOLIA_RPC_URL, MUMBAI_RPC_URL } = process.env;

export const destinationChainSepolia = "16015286601757825753";
export const destinationChainMumbai = "12532609583862916517";
// export const destinationChainBNB = "13264668187771770619";
// Sepolia
export const destinationChainBNB = "16015286601757825753";

// Link Router Address
export const routerSepolia = "0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59";
export const routerMumbai = "0x1035cabc275068e0f4b745a29cedf38e13af41b1";
// export const routerBNB = "0xe1053ae1857476f36a3c62580ff9b016e8ee8f6f";
// Sepolia
export const routerBNB = "0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59";

// $LINK Address
export const linkSepolia = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
export const linkMumbai = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
// export const linkBNB = "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06";
// Sepolia
export const linkBNB = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

export async function blocktimestamp(): Promise<any> {
  return (await ethers.provider.getBlock("latest")).timestamp;
}

export async function getSigners() {
  const rpcSepolia = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const rpcMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);

  // Sginers
  var signerSepolia = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcSepolia);
  var signerMumbai = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcMumbai);

  return [signerSepolia, signerMumbai];
}

export function saveContractAddress(varName: string, contractAddress: string) {
  const filePath = path.join(__dirname, "../.env");

  fs.readFile(filePath, "utf8", (readErr: any, data: string) => {
    if (readErr) {
      console.error("Error reading .env file:", readErr);
      return;
    }

    let newContent = data.replace(
      new RegExp(`${varName}=.*`),
      `${varName}=${contractAddress}`
    );

    fs.writeFile(filePath, newContent, "utf8", (writeErr: any) => {
      if (writeErr) {
        console.error("Error writing to .env file:", writeErr);
      } else {
        console.log("Contract address saved in .env file:", contractAddress);
      }
    });
  });
}
