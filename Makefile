export

# Define the commands to run your yarn scripts
clean:
	yarn clean

compile:
	yarn compile

deploy:
	yarn deploy

deployMock:
	yarn deployMock

allowChain:
	yarn allowChain

allowlist:
	yarn allowlist

mint:
	yarn mint

approve:
	yarn approve

send:
	yarn send

# Define a target to run the scripts in sequence
test: clean compile deploy deployMock allowlist mint approve send