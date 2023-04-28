# Use current branch name as stack name. Remove non-alphanumeric characters
BRANCH_NAME := $(shell git rev-parse --abbrev-ref HEAD | tr -d '[:space:]' | tr -cd '[:alnum:]')

build: 
		sam build --no-cached

deploy: build
		sam deploy --stack-name $(BRANCH_NAME)

# Invoke function locally. To change search term, edit events/event.json `rawPath` value
local: build
		sam local invoke Handler --event events/event.json --env-vars events/env_vars.json

remove:
	sam delete --stack-name $(BRANCH_NAME)