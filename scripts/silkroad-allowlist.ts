import { ethers } from "hardhat";
import dotenv from "dotenv";
import { mumbai_chain_selector, bnb_chain_selector } from "../scripts/utils";
dotenv.config();

const {
  DEPLOYER_PRIVATE_KEY,
  MUMBAI_RPC_URL,
  BSCTESTNET_RPC_URL,
  SWAPLACE_MUMBAI,
  SWAPLACE_BNB,
} = process.env;

export async function deployCCIP() {
  const rpcMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);
  const rpcBNB = new ethers.providers.JsonRpcProvider(BSCTESTNET_RPC_URL);

  var signerMumbai = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcMumbai);
  var signerBNB = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcBNB);

  const ContractMumbai = await ethers.getContractAt(
    "Swaplace",
    SWAPLACE_MUMBAI as string,
    signerMumbai
  );

  const ContractBNB = await ethers.getContractAt(
    "Swaplace",
    SWAPLACE_BNB as string,
    signerBNB
  );

  var tx = await ContractMumbai.connect(signerMumbai).allowlistSender(
    bnb_chain_selector,
    ContractBNB.address,
    { gasLimit: 4000000 }
  );
  await tx.wait();

  var tx = await ContractBNB.connect(signerBNB).allowlistSender(
    mumbai_chain_selector,
    ContractMumbai.address,
    { gasLimit: 4000000 }
  );
  await tx.wait();

  var res = await ContractMumbai.allowlistSenders(bnb_chain_selector);
  var res = await ContractBNB.allowlistSenders(mumbai_chain_selector);

  console.log(
    "\nThe Mumbai Address that was allowlist",
    ContractMumbai.address
  );
  console.log("Destination Chain that was saved", mumbai_chain_selector);
  console.log("\nThe BNB Address that was allowlist", ContractBNB.address);
  console.log("Destination Chain that was saved", bnb_chain_selector);
  console.log(
    "\nAllowlisted Mumbai chain on BNB, the allowed Swaplace address on Mumbai -> %s",
    res
  );
  console.log(
    "Allowlisted BNB chain on Mumbai, the allowed Swaplace address on BNB -> %s",
    res
  );
}

deployCCIP().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
