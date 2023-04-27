build: 
		sam build

deploy: build
		sam deploy

# Invoke function locally. To change search term, edit events/event.json `rawPath` value
local: build
		sam local invoke Handler --event events/event.json --env-vars events/env_vars.json