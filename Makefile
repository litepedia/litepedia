build: 
		sam build

deploy: build
		sam deploy

local: build
		sam local invoke Handler --event events/event.json --env-vars events/env_vars.json