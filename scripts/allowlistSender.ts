import { ethers } from "hardhat";
import { getSigners } from "./utils";
import dotenv from "dotenv";
dotenv.config();

const { OVERSWAP_SEPOLIA, OVERSWAP_MUMBAI } = process.env;

export async function allowlistSender() {
  const [signerSepolia, signerMumbai] = await getSigners();
  const OverswapSepolia = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_SEPOLIA as string,
    signerSepolia
  );
  const OverswapMumbai = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_MUMBAI as string,
    signerMumbai
  );

  // Set allowlists for the ccip senders
  // The senders should be the same contact but on different chains
  await OverswapSepolia.allowlistSender(OverswapMumbai.address, true);
  await OverswapMumbai.allowlistSender(OverswapSepolia.address, true);
  console.log("Allowlisted Senders\n");
}

allowlistSender().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
