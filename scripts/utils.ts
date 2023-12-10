import { ethers } from "hardhat";
import dotenv from "dotenv";
const fs = require("fs");
const path = require("path");
dotenv.config();

const { DEPLOYER_PRIVATE_KEY, SEPOLIA_RPC_URL, MUMBAI_RPC_URL } = process.env;

export const destinationChainSepolia = "16015286601757825753";
export const destinationChainMumbai = "12532609583862916517";

// Link Router Address
export const routerSepolia = "0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59";
export const routerMumbai = "0x1035cabc275068e0f4b745a29cedf38e13af41b1";

// $LINK Address
export const linkSepolia = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
export const linkMumbai = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";

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
