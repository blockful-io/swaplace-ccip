import { ethers } from "hardhat";

async function deploy(signer: any, router: string, link: string) {
  const Factory = await ethers.getContractFactory("Messenger", signer);
  const Contract = await Factory.deploy(router, link);
  await Contract.deployed();
  return Contract;
}

async function main() {
  const [signer] = await ethers.getSigners();

  // Router Address
  const router = "0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59"; // Sepolia
  // const router = "0x1035cabc275068e0f4b745a29cedf38e13af41b1"; // Mumbai

  // $LINK Address
  const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia
  // const link = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Mumbai

  // Destination Chain
  const destinationChain = "12532609583862916517"; // Mumbai
  // const destinationChain = "16015286601757825753"; // Sepolia

  // Deploy a new contract instead, and allowlist the destination chain in sequence (setup)
  //   const Contract = await deploy(signer, router, link);
  //   await Contract.allowlistDestinationChain(destinationChain, true);

  // Last deployed contract address
  const Contract = await ethers.getContractAt(
    "Messenger",
    "0x548ef7D55751178EbD3Fb1f15E0aDC208795C7bD",
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

  // Send Link to contract
  //   const LinkContract = new ethers.Contract(
  //     link,
  //     ["function transfer(address to, uint256 value)"],
  //     signer
  //   );
  //   await LinkContract.transfer(Contract.address, ethers.utils.parseEther("0.1"));
  //   console.log("Sent 0.1 LINK to contract %s", Contract.address);

  // Send Native to contract
  //   await signer.sendTransaction({
  //     to: Contract.address,
  //     value: ethers.utils.parseEther("0.1"),
  //   });

  // Send CCIP Message
  const tx = await Contract.connect(signer).sendMessagePayLINK(
    destinationChain,
    Contract.address,
    "Hello Mumbai!",
    {
      gasLimit: 1000000,
    }
  );
  //   const tx = await Contract.connect(signer).sendMessagePayNative(
  //     destinationChain,
  //     Contract.address,
  //     "Hello Mumbai!",
  //     {
  //       gasLimit: 1000000,
  //     }
  //   );

  const receipt = await tx.wait();
  console.log("\nSent CCIP Message \nTx %s\n", receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
