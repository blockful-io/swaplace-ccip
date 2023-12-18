export

# Define the commands to run your yarn scripts
clean:
	yarn clean

compile:
	yarn compile

deploy-mock-sepolia:
	yarn deploy-mock --network sepolia

deploy-mock-mumbai:
	yarn deploy-mock --network mumbai

deploy-swaplace-sepolia:
	yarn deploy-swaplace --network sepolia

deploy-swaplace-mumbai:
	yarn deploy-swaplace --network mumbai

execute:
	yarn execute

# Define a target to run the scripts in sequence
deploy-mock: deploy-mock-sepolia deploy-mock-mumbai

deploy-swaplace: deploy-swaplace-sepolia deploy-swaplace-mumbai

swaplace: clean compile deploy-mock deploy-swaplace execute