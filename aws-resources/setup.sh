#!/bin/bash

# AWS CLI configuration
REGION="us-east-2"
STACK_NAME="WebflareAdminAPI"

# Create DynamoDB tables first
echo "Creating DynamoDB tables..."
aws cloudformation deploy \
    --region $REGION \
    --stack-name "WebflareAdminDynamoDB" \
    --template-file dynamodb.yaml \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
    Environment=prod

# Create CloudFormation stack for API Gateway and Lambda
echo "Creating CloudFormation stack..."
aws cloudformation deploy \
    --region $REGION \
    --stack-name $STACK_NAME \
    --template-file cloudformation.yaml \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --parameter-overrides \
    Environment=prod \
    Region=$REGION

# Get API Gateway URL
echo "Getting API Gateway URL..."
API_ID=$(aws cloudformation describe-stacks \
    --region $REGION \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayId`].OutputValue' \
    --output text)

API_URL="https://$API_ID.execute-api.$REGION.amazonaws.com/prod"
echo "API Gateway URL: $API_URL"

echo "Update your config.js with this API URL:" \
    "endpoint: '$API_URL'"
