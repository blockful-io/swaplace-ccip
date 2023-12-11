import { ethers } from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const {
  DEPLOYER_PRIVATE_KEY,
  MUMBAI_RPC_URL,
  BSCTESTNET_RPC_URL,
  OVERSWAP_MUMBAI,
  OVERSWAP_BNB,
} = process.env;

async function main() {
  const rpcMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);
  const rpcBNB = new ethers.providers.JsonRpcProvider(BSCTESTNET_RPC_URL);

  var signerMumbai = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcMumbai);
  var signerBNB = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcBNB);

  const ContracMumbai = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_MUMBAI as string,
    signerMumbai
  );

  const ContractBNB = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_BNB as string,
    signerBNB
  );

  // Check las message received
  var response = await ContracMumbai.lastReceivedMessageId();
  console.log(
    "Received response: %s \n On address: %s",
    response,
    ContracMumbai.address
  );

  var response = await ContractBNB.lastReceivedMessageId();
  console.log(
    "Received response: %s \n On address: %s",
    response,
    ContractBNB.address
  );

  // Check unlock steps amount
  var proof =
    "0x89ba2a82aad4b4f09b6843674b3e4a857b24e9e212bc836cfbcf7f9956de50ab";
  var response = await ContracMumbai.getUnlockSteps(proof);
  console.log("Received response: %s on Mumbai", response);

  var response = await ContractBNB.getUnlockSteps(proof);
  console.log("Received response: %s on BNB", response);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
