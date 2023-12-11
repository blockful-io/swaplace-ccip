## Swaplace

**A decentralized Cross-Chain P2P Swap protocol.**

Swap assets in chain A for assets in chain B, totally trustless.

### Installation

- Install [nodejs](https://nodejs.org/en/download/)
- Install [hardhat](https://hardhat.org/getting-started/#installation)
- Install `yarn` with `npm install -g yarn`
- Install dependencies with `yarn`
- Copy the ".env.example" file and rename it to ".env", filling the variables
- Make sure your wallet is funded with link, ETH and you are on Sepolia

NOTE: We mocked the BNB rpc into Sepolia in the last second to have the official deploy for the hackathon on the chain of our front-end.

## Usage

### Deploy the main contracts and run the entire flux using

- Prepare Mock Contract for ERC20 or ERC721 by calling the deploy-mock script with the network you want to deploy to. Don't forget to place them in the `hardhat.config.js` file. For this repository, we used the ERC721 mock.

```shell
$ yarn deploy-mock --network <chain>
```

- Then fill the `.env` file with the addresses of the deployed contracts.

- Acquire some LINK for the chains listed in the [Chainlink documentation](https://docs.chain.link/resources/acquire-link).

- Run the entire flow with

```shell
$ make all
```

That's it.
