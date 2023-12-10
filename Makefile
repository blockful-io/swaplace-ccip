export

# Define the commands to run your yarn scripts
clean:
	yarn clean

compile:
	yarn compile

deploy-mumbai:
	yarn deploy-mumbai

deploy-bsc:
	yarn deploy-bsc

allowlist:
	yarn allowlist

createswap:
	yarn create-swap

acceptswap:
	yarn accept-swap

# Define a target to run the scripts in sequence
all: clean compile deploy-mumbai deploy-bsc allowlist createswap acceptswap