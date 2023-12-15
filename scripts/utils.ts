import { ethers } from "hardhat";
import dotenv from "dotenv";
const fs = require("fs");
const path = require("path");
dotenv.config();

// Destination Chains Selectors
// Link Router Address
// $LINK Address
// https://docs.chain.link/ccip/supported-networks/v1_2_0/testnet

export const sepolia_chain_selector = "16015286601757825753";
export const mumbai_chain_selector = "12532609583862916517";
export const bnb_chain_selector = "13264668187771770619";
export const fuji_chain_selector = "14767482510784806043";
export const base_goerli_chain_selector = "5790810961207155433";
export const op_goerli_chain_selector = "2664363617261496610";

export const sepolia_router = "0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59";
export const mumbai_router = "0x1035cabc275068e0f4b745a29cedf38e13af41b1";
export const bnb_router = "0xe1053ae1857476f36a3c62580ff9b016e8ee8f6f";
export const fuji_router = "0xf694e193200268f9a4868e4aa017a0118c9a8177";
export const base_goerli_router = "0x80af2f44ed0469018922c9f483dc5a909862fdc2";
export const op_goerli_router = "0xcc5a0b910d9e9504a7561934bed294c51285a78d";

export const sepolia_link = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
export const mumbai_link = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
export const bnb_link = "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06";
export const fuji_link = "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846";
export const base_goerli_link = "0xd886e2286fd1073df82462ea1822119600af80b6";
export const op_goerli_link = "0xdc2CC710e42857672E7907CF474a69B63B93089f";

export async function getMockFromEnv() {
  const chainId = (await ethers.provider.getNetwork()).chainId;

  let mock = {
    address: "",
    envName: "",
  };

  let contractAddress: string;

  if (chainId == 11155111) {
    mock.address = process.env.ERC721_SEPOLIA as string;
    mock.envName = "ERC721_SEPOLIA";
  } else if (chainId == 80001) {
    mock.address = process.env.ERC721_MUMBAI as string;
    mock.envName = "ERC721_MUMBAI";
  } else if (chainId == 97) {
    mock.address = process.env.ERC721_BNB as string;
    mock.envName = "ERC721_BNB";
  } else if (chainId == 43113) {
    mock.address = process.env.ERC721_FUJI as string;
    mock.envName = "ERC721_FUJI";
  } else if (chainId == 84531) {
    mock.address = process.env.ERC721_BASE_GOERLI as string;
    mock.envName = "ERC721_BASE_GOERLI";
  } else if (chainId == 420) {
    mock.address = process.env.ERC721_OP_GOERLI as string;
    mock.envName = "ERC721_OP_GOERLI";
  } else {
    throw new Error("Invalid chain ID fo CCIP");
  }

  return mock;
}

export async function blocktimestamp(): Promise<any> {
  return (await ethers.provider.getBlock("latest")).timestamp;
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
