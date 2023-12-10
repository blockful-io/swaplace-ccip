import { ethers } from "hardhat";
import dotenv from "dotenv";
import { destinationChainMumbai, destinationChainBNB } from "../scripts/utils";
dotenv.config();

const {
  DEPLOYER_PRIVATE_KEY,
  MUMBAI_RPC_URL,
  BSCTESTNET_RPC_URL,
  OVERSWAP_MUMBAI,
  OVERSWAP_BNB,
} = process.env;

export async function deployCCIP() {
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

  var tx = await ContracMumbai.connect(signerMumbai).allowlistSender(
    destinationChainBNB,
    ContractBNB.address
  );
  await tx.wait();

  var tx = await ContractBNB.connect(signerBNB).allowlistSender(
    destinationChainMumbai,
    ContracMumbai.address
  );
  await tx.wait();

  var res = await ContracMumbai.allowlistSenders(destinationChainBNB);
  var res = await ContractBNB.allowlistSenders(destinationChainMumbai);

  console.log("\nThe Mumbai Address that was allowlist", ContracMumbai.address);
  console.log("Destination Chain that was saved", destinationChainMumbai);
  console.log("\nThe BNB Address that was allowlist", ContractBNB.address);
  console.log("Destination Chain that was saved", destinationChainBNB);
  console.log(
    "\nAllowlisted Mumbai chain on BNB, the allowed Overswap address on Mumbai -> %s",
    res
  );
  console.log(
    "Allowlisted BNB chain on Mumbai, the allowed Overswap address on BNB -> %s",
    res
  );
}

deployCCIP().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
