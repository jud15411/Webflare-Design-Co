#!/bin/bash

STACK_NAME="webflare-admin"
REGION="us-east-2"
BUCKET_NAME="webflare-admin-lambda-us-east-2"
LAMBDA_KEY="lambda-deployment.zip"

# Check if stack exists
echo "Checking if stack exists..."
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION 2>/dev/null; then
    echo "Stack exists, updating..."
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://cloudformation/template.yaml \
        --parameters \
            ParameterKey=LambdaCodeBucket,ParameterValue=$BUCKET_NAME \
            ParameterKey=LambdaCodeKey,ParameterValue=$LAMBDA_KEY \
            ParameterKey=Environment,ParameterValue=dev \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION
    
    echo "Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION
else
    echo "Creating new stack..."
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://cloudformation/template.yaml \
        --parameters \
            ParameterKey=LambdaCodeBucket,ParameterValue=$BUCKET_NAME \
            ParameterKey=LambdaCodeKey,ParameterValue=$LAMBDA_KEY \
            ParameterKey=Environment,ParameterValue=dev \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION
    
    echo "Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION
fi

echo "Stack deployment complete!"

# Get outputs
echo "Getting stack outputs..."
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table \
    --region $REGION
