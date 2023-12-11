## Swaplace

**A decentralized Cross-Chain P2P Swap protocol.**

Swap assets in chain A for assets in chain B, totally trustless.

### Installation

- Install [nodejs](https://nodejs.org/en/download/
- Install [hardhat](https://hardhat.org/getting-started/#installation)
- Install `yarn` with `npm install -g yarn`
- Install dependencies with `yarn`
- Copy the ".env.example" file and rename it to ".env", filling the variables
- Make sure your wallet is funded with link, ETH and you are on Sepolia

NOTE: We mocked the BNB rpc into Sepolia in the last second to have the official deploy for the hackathon on the chain of our front-end.

## Usage

In order to run the complete flow of buying an insurance to getting refunded, we have 6 stepsm

### Deploy the main contracts and run the entire flux using

- Prepare a Mock ERC721 calling the deploy-mock script with the network you want to deploy to.

```shell
$ yarn deploy-mock --network <chain>
```

- Then fill the `.env` file with the addresses of the deployed contracts.

- Run the entire flow with

```shell
$ make all
```

That's it, have great trips!
