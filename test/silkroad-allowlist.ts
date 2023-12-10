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

  const Mumbai = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_MUMBAI as string,
    signerMumbai
  );

  const BNB = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_BNB as string,
    signerBNB
  );

  await Mumbai.connect(signerMumbai).allowlistSender(
    destinationChainBNB,
    OVERSWAP_BNB
  );
  var res = await Mumbai.allowlistSenders(destinationChainBNB);
  console.log(
    "Allowlisted BNB chain on Mumbai, the allowed Overswap address -> %s",
    res
  );

  await BNB.connect(signerBNB).allowlistSender(
    destinationChainMumbai,
    OVERSWAP_MUMBAI
  );
  var res = await BNB.allowlistSenders(destinationChainMumbai);
  console.log(
    "Allowlisted Mumbai chain on BNB, the allowed Overswap address -> %s",
    res
  );
}

deployCCIP().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
