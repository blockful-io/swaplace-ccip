import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  // $LINK Address
  const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia
  // const link = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Mumbai

  // Destination Chain
  const destinationChain = "12532609583862916517"; // Mumbai
  // const destinationChain = "16015286601757825753"; // Sepolia

  // Last Mock Deployed
  const mockERC721_sepolia = "0x86429c298e86BC6a04f3b31F27e637ca769AaC55"; // sepolia
  const mockERC721_mumbai = "0xa421Df2dc83fEE5afda1fAB244bfF56566ba83F4"; // mumbai

  // Official Deployed
  const Overswap = "0x5983E90123ccC820b96FAa34153530eF6621a17C"; // sepolia
  // const Overswap = "0x416AbcB8217721C6a12f776419aaFc27391eA5c3"; // mumbai

  // Last deployed contract address
  const Contract = await ethers.getContractAt("Overswap", Overswap, signer);

  // Last deployed contract address
  const MockContract = await ethers.getContractAt(
    "MockERC721",
    mockERC721_sepolia,
    signer
  );

  // Approve usage of link
  const Link = new ethers.Contract(
    link,
    [
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    signer
  );
  await Link.connect(signer).approve(
    Contract.address,
    ethers.utils.parseEther("0.1")
  );

  // Create a trade
  const bidingAddr = [MockContract.address];
  const bidingAmountOrId = [1];

  const askingAddr = [MockContract.address];
  const askingAmountOrId = [50];

  const swap: Swap = await composeSwap(
    owner.address,
    zeroAddress,
    (await blocktimestamp()) * 2,
    bidingAddr,
    bidingAmountOrId,
    askingAddr,
    askingAmountOrId
  );

  // Send CCIP Message
  const tx = await Contract.connect(signer).sendMessagePayLINK(
    destinationChain,
    Contract.address,
    "Hello Mumbai!",
    {
      gasLimit: 1000000,
    }
  );

  const receipt = await tx.wait();
  console.log("\nSent CCIP Message \nTx %s\n", receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
