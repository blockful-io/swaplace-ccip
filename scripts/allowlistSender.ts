import { ethers } from "hardhat";
import { destinationChainBNB, destinationChainMumbai } from "./utils";
import dotenv from "dotenv";
dotenv.config();

const {
  DEPLOYER_PRIVATE_KEY,
  MUMBAI_RPC_URL,
  BSCTESTNET_RPC_URL,
  OVERSWAP_MUMBAI,
  OVERSWAP_BNB,
} = process.env;

export async function allowlistSender() {
  const rpcMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);
  const rpcBNB = new ethers.providers.JsonRpcProvider(BSCTESTNET_RPC_URL);

  var signerMumbai = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcMumbai);
  var signerBNB = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcBNB);

  const OverswapBNB = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_BNB as string,
    signerBNB
  );
  const OverswapMumbai = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_MUMBAI as string,
    signerMumbai
  );

  // Set allowlists for the ccip senders
  // The senders should be the same contact but on different chains
  await OverswapBNB.allowlistSender(destinationChainMumbai, true);
  await OverswapMumbai.allowlistSender(destinationChainBNB, true);
  console.log("Allowlisted Senders\n");
}

allowlistSender().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
