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

export async function getMockData(chainSelector?: any) {
  const _chainId = chainSelector
    ? chainSelector
    : (await ethers.provider.getNetwork()).chainId;

  let data = {
    rpcUrl: "",
    address: "",
    envName: "",
    chainId: 0,
    chainSelector: "",
  };

  switch (_chainId) {
    case 11155111:
    case sepolia_chain_selector:
      data.rpcUrl = process.env.SEPOLIA_RPC_URL as string;
      data.address = process.env.ERC721_SEPOLIA as string;
      data.envName = "ERC721_SEPOLIA";
      data.chainId = _chainId;
      data.chainSelector = sepolia_chain_selector;
      break;

    case 80001:
    case mumbai_chain_selector:
      data.rpcUrl = process.env.MUMBAI_RPC_URL as string;
      data.address = process.env.ERC721_MUMBAI as string;
      data.envName = "ERC721_MUMBAI";
      data.chainId = _chainId;
      data.chainSelector = mumbai_chain_selector;
      break;

    case 97:
    case bnb_chain_selector:
      data.rpcUrl = process.env.BNB_RPC_URL as string;
      data.address = process.env.ERC721_BNB as string;
      data.envName = "ERC721_BNB";
      data.chainId = _chainId;
      data.chainSelector = bnb_chain_selector;
      break;

    case 43113:
    case fuji_chain_selector:
      data.rpcUrl = process.env.FUJI_RPC_URL as string;
      data.address = process.env.ERC721_FUJI as string;
      data.envName = "ERC721_FUJI";
      data.chainId = _chainId;
      data.chainSelector = fuji_chain_selector;
      break;

    case 84531:
    case base_goerli_chain_selector:
      data.rpcUrl = process.env.BASE_GOERLI_RPC_URL as string;
      data.address = process.env.ERC721_BASE_GOERLI as string;
      data.envName = "ERC721_BASE_GOERLI";
      data.chainId = _chainId;
      data.chainSelector = base_goerli_chain_selector;
      break;

    case 420:
    case op_goerli_chain_selector:
      data.rpcUrl = process.env.OP_GOERLI_RPC_URL as string;
      data.address = process.env.ERC721_OP_GOERLI as string;
      data.envName = "ERC721_OP_GOERLI";
      data.chainId = _chainId;
      data.chainSelector = op_goerli_chain_selector;
      break;

    default:
      throw new Error("Invalid chain ID fo CCIP");
  }

  return data;
}

export async function getSwaplaceData(chainSelector?: any) {
  const _chainId = chainSelector
    ? chainSelector
    : (await ethers.provider.getNetwork()).chainId;

  let data = {
    rpcUrl: "",
    address: "",
    envName: "",
    chainSelector: "",
    routerAddress: "",
    linkAddress: "",
    chainId: 0,
  };

  switch (_chainId) {
    case 11155111:
    case sepolia_chain_selector:
      data.rpcUrl = process.env.SEPOLIA_RPC_URL as string;
      data.address = process.env.SWAPLACE_SEPOLIA as string;
      data.envName = "SWAPLACE_SEPOLIA";
      data.chainSelector = sepolia_chain_selector;
      data.routerAddress = sepolia_router;
      data.linkAddress = sepolia_link;
      data.chainId = _chainId;
      break;

    case 80001:
    case mumbai_chain_selector:
      data.rpcUrl = process.env.MUMBAI_RPC_URL as string;
      data.address = process.env.SWAPLACE_MUMBAI as string;
      data.envName = "SWAPLACE_MUMBAI";
      data.chainSelector = mumbai_chain_selector;
      data.routerAddress = mumbai_router;
      data.linkAddress = mumbai_link;
      data.chainId = _chainId;
      break;

    case 97:
    case bnb_chain_selector:
      data.rpcUrl = process.env.BNB_TESTNET_RPC_URL as string;
      data.address = process.env.SWAPLACE_BNB as string;
      data.envName = "SWAPLACE_BNB";
      data.chainSelector = bnb_chain_selector;
      data.routerAddress = bnb_router;
      data.linkAddress = bnb_link;
      data.chainId = _chainId;
      break;

    case 43113:
    case fuji_chain_selector:
      data.rpcUrl = process.env.FUJI_RPC_URL as string;
      data.address = process.env.SWAPLACE_FUJI as string;
      data.envName = "SWAPLACE_FUJI";
      data.chainSelector = fuji_chain_selector;
      data.routerAddress = fuji_router;
      data.linkAddress = fuji_link;
      data.chainId = _chainId;
      break;

    case 84531:
    case base_goerli_chain_selector:
      data.rpcUrl = process.env.BASE_GOERLI_RPC_URL as string;
      data.address = process.env.SWAPLACE_BASE_GOERLI as string;
      data.envName = "SWAPLACE_BASE_GOERLI";
      data.chainSelector = base_goerli_chain_selector;
      data.routerAddress = base_goerli_router;
      data.linkAddress = base_goerli_link;
      data.chainId = _chainId;
      break;

    case 420:
    case op_goerli_chain_selector:
      data.rpcUrl = process.env.OP_GOERLI_RPC_URL as string;
      data.address = process.env.SWAPLACE_OP_GOERLI as string;
      data.envName = "SWAPLACE_OP_GOERLI";
      data.chainSelector = op_goerli_chain_selector;
      data.routerAddress = op_goerli_router;
      data.linkAddress = op_goerli_link;
      data.chainId = _chainId;
      break;

    default:
      throw new Error("Invalid chain ID fo CCIP");
  }

  return data;
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
        console.log("Contract address saved in .env: %s \n", contractAddress);
      }
    });
  });
}
