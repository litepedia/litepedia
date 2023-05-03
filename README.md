# litepedia

A little app to help you understand and have fun with even the most complicated WikiPedia articles!

## Prerequisites

1. Deployment is handled by [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html#what-is-sam-cli). Ensure you have [the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html) setup properly.
2. [Create an OpenAI API key](https://platform.openai.com/account/api-keys) for communicating with the ChatGPT API.

## Getting started

1. Checkout a new branch. The [stack name](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-console-create-stack-parameters.html) will be based on your branch name.
2. Run `make deploy` to create all necessary AWS resources in your account. Press `y` when prompted.
3. When the deployment has finished, look for the `OpenAPIKeyParam` key in the **Outputs** section of the terminal printout. Copy the `Value` (the name of the created SSM Paramter).
4. Run the following command, changing the `--name` and `--value` flags, to add your OpenAI API key to this parameter. We need to do this manually as CloudFormation cannot create encrypted parameters: `aws ssm put-parameter --overwrite --name THE-NAME-YOU-COPIED-FROM-OUTPUTS --type SecureString --value YOUR-OPEN-AI-API-KEY`.
5. Click the `FunctionUrlEndpoint` URL in the Outputs to take you to the Litepedia homepage.

## Developing

After making changes, run `make deploy` to push your changes up to AWS. Unfortunately, `sam sync` does not work, as we have to manually copy over the `views` and `public` folders into the build directory.

### Frontend development

See the `handler/local-dev` folder.
