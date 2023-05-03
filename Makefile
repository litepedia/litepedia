-include .makerc

# Use current branch name as stack name. Remove non-alphanumeric characters
BRANCH_NAME := $(shell git rev-parse --abbrev-ref HEAD | tr -d '[:space:]' | tr -cd '[:alnum:]')

# Add tags if specified, otherwise use empty string
TAGS ?= ${if ${STACK_TAGS}, ${STACK_TAGS}, ""}

build: 
	sam build --no-cached

deploy: build
# Need to manually bundle views and public folders to build folder
	cp -r handler/views handler/public .aws-sam/build/Handler
	sam deploy --stack-name $(BRANCH_NAME) --tags $(TAGS) --parameter-overrides domainName=$(DOMAIN_NAME) hostedZoneName=$(HOSTED_ZONE_NAME) certificateArn=$(CERTIFICATE_ARN)

remove:
	sam delete --stack-name $(BRANCH_NAME)

# Invoke function locally. To change search term, edit events/event.json `rawPath` value
local: build
	sam local invoke Handler --event events/event.json --env-vars events/env_vars.json

sync:
	sam sync --stack-name $(BRANCH_NAME) --no-watch 

logs:
	sam logs --stack-name $(BRANCH_NAME) --tail