import { ethers } from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const {
  DEPLOYER_PRIVATE_KEY,
  MUMBAI_RPC_URL,
  BSCTESTNET_RPC_URL,
  OVERSWAP_MUMBAI,
  OVERSWAP_BNB,
  ERC721_BNB,
  ERC721_MUMBAI,
} = process.env;

async function main() {
  const rpcMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);
  const rpcBNB = new ethers.providers.JsonRpcProvider(BSCTESTNET_RPC_URL);

  var signerMumbai = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcMumbai);
  var signerBNB = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcBNB);

  const ContractMumbai = await ethers.getContractAt(
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
  var response = await ContractMumbai.lastReceivedMessageId();
  console.log(
    "Received response: %s \n On address: %s",
    response,
    ContractMumbai.address
  );

  var response = await ContractBNB.lastReceivedMessageId();
  console.log(
    "Received response: %s \n On address: %s",
    response,
    ContractBNB.address
  );

  // Check unlock steps amount
  var proof =
    "0x30f64ede7fd59320e349d506dff95d33ee5208f9a7ea2e4e5fd005da49a8f694";
  var response = await ContractMumbai.getUnlockSteps(proof);
  console.log("Unlocks achieved: %s on Mumbai", response);

  var response = await ContractBNB.getUnlockSteps(proof);
  console.log("Unlocks achieved: %s on BNB", response);

  // Check total swaps
  var response = await ContractMumbai.totalSwaps();
  console.log("Last Swap ID: %s on Mumbai", response);

  var response = await ContractBNB.totalSwaps();
  console.log("Last Swap ID: %s on BNB", response);

  // Check the balance of each swap
  const MockERC721BNB = await ethers.getContractAt(
    "MockERC721",
    ERC721_BNB as string,
    signerBNB
  );
  const MockERC721Mumbai = await ethers.getContractAt(
    "MockERC721",
    ERC721_MUMBAI as string,
    signerMumbai
  );

  var balance = await MockERC721BNB.balanceOf(ContractBNB.address);
  console.log("Balance asking:", balance.toString());
  var balance = await MockERC721Mumbai.balanceOf(ContractMumbai.address);
  console.log("Balance asking:", balance.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
