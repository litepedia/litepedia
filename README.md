# litepedia

A little app to help you understand and have fun with even the most complicated Wikipedia articles!

## Prerequisites

1. Deployment is handled by [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html#what-is-sam-cli). Ensure you have [the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html) setup properly.
2. [Create an OpenAI API key](https://platform.openai.com/account/api-keys) for communicating with the ChatGPT API.
3. Ensure you have your setup [a public hosted zone in Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html) for your domain.
4. Ensure you have [a ACM certificate](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html) that is [DNS validated](https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html).

## Getting started

1. Checkout a new branch. The [stack name](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-console-create-stack-parameters.html) will be based on your branch name.
2. Copy and rename the `.makerc_example` file to `.makerc`. Add values for the following keys:

```
- DOMAIN_NAME: The domain name (eg. summariser.com, test.summariser.com) you want to use. Note: the domain you specify must be covered by the domain names specifed in your previously created ACM certificate
- HOSTED_ZONE_NAME: The name of your previously created Route 53 hosted zone name
- CERTIFICATE_ARN: The ARN of your previously created ACM certificate
- STACK_TAGS: (optional) Tags you want added to your CloudFormation resources in the form of "key=value key2=value2"
```

3. Run `make deploy` to create all necessary AWS resources in your account. Press `y` when prompted.
4. When the deployment has finished, look for the `OpenAPIKeyParam` key in the **Outputs** section of the terminal printout. Copy the `Value` (the name of the created SSM Paramter).
5. Run the following command, changing the `--name` and `--value` flags, to add your OpenAI API key to this parameter. We need to do this manually as CloudFormation cannot create encrypted parameters: `aws ssm put-parameter --overwrite --name THE-NAME-YOU-COPIED-FROM-OUTPUTS --type SecureString --value YOUR-OPEN-AI-API-KEY`.
6. Click the `BaseUrl` in the Outputs to take you to your deployed Litepedia homepage!

## Developing

After making changes, run `make deploy` to push your changes up to AWS. Unfortunately, `sam sync` does not work, as we have to manually copy over the `views` and `public` folders into the build directory.

### Frontend development

See the `handler/local-dev` folder.

## Troubleshooting

### Internal Server Error

Did you remember to update the created SSM parameter with your OpenAI API key? See **step 5** in the [Getting started](#getting-started) section
