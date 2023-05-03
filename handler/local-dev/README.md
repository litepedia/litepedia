## What's this?

A setup to enable local frontend Litepedia development without the need to re-deploy the entire application to see frontend changes.

## Usage

1. Ensure you have run `npm i` inside `handler` folder
2. Run `node handler/local-dev/index.mjs` to start the development server
3. Make changes to the frontend assets (see the `views` and `public` folders). You may need to restart the Node command to see your changes.

## Caveats

Please note this does not talk to the real backend and just displays mocked data
