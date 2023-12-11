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

export async function main() {
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

  var lastSwapId = await ContractMumbai.totalSwaps();
  console.log(await ContractMumbai.getSwap(lastSwapId));

  // ethers abi encode funcition call
  const encoded = ContractMumbai.interface.encodeFunctionData(
    "redeem(uint256)",
    [lastSwapId]
  );

  var tx = await signerMumbai.sendTransaction({
    to: ContractMumbai.address,
    data: encoded,
    gasLimit: 4000000,
    maxFeePerGas: 20001002003,
    maxPriorityFeePerGas: 20001002003,
  });
  // var tx = await ContractMumbai.redeem(lastSwapId);
  await tx.wait();
  console.log("Mumbai: Redeemed Swap ID %s at tx: %s", lastSwapId, tx.hash);

  // var lastSwapId = await ContractBNB.totalSwaps();
  // var tx = await ContractBNB.redeem(lastSwapId);
  // await tx.wait();
  // console.log("BNB: Redeemed Swap ID %s at tx: %s", lastSwapId, tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
