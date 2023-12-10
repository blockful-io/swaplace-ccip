import { ethers } from "hardhat";
import { deployCCIP } from "./deploy";
import { getSigners } from "./utils";
import { allowlistDestinationChain } from "./allowlistDestinationChain";
import { allowlistSender } from "./allowlistSender";
import { deployMock721 } from "./deployMock";
import { mintMockTokens } from "./mockMint";
import { approveLinkSignerChain } from "./approve";
import { sendMessagePayLINK } from "./sendMessagePayLINK";
import { allowlistSourceChain } from "./allowlistSourceChain";

async function main() {
  const [signerSepolia, signerMumbai] = await getSigners();

  await deployCCIP();
  await deployMock721();

  await allowlistDestinationChain();
  await allowlistSourceChain();
  await allowlistSender();

  await mintMockTokens(signerSepolia, 1);
  await mintMockTokens(signerMumbai, 1);

  await approveLinkSignerChain(signerSepolia, ethers.utils.parseEther("5"));
  await approveLinkSignerChain(signerMumbai, ethers.utils.parseEther("5"));

  await sendMessagePayLINK(signerSepolia, "Hello Mumbai!");
  await sendMessagePayLINK(signerMumbai, "Hello Sepolia!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
