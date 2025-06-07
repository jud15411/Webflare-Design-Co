#!/bin/bash

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install AWS CLI first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "AWS credentials not configured. Please configure AWS credentials first."
    exit 1
fi

# Deploy DynamoDB tables using CloudFormation
stack_name="webflare-admin"

# Check if stack already exists
if aws cloudformation describe-stacks --stack-name $stack_name &> /dev/null; then
    echo "Updating existing stack..."
    aws cloudformation update-stack \
        --stack-name $stack_name \
        --template-body file://webflare-admin.yaml \
        --capabilities CAPABILITY_IAM
else
    echo "Creating new stack..."
    aws cloudformation create-stack \
        --stack-name $stack_name \
        --template-body file://webflare-admin.yaml \
        --capabilities CAPABILITY_IAM
fi

# Wait for stack to complete
aws cloudformation wait stack-create-complete --stack-name $stack_name

# Get output values
outputs=$(aws cloudformation describe-stacks --stack-name $stack_name --query 'Stacks[0].Outputs' --output json)

# Print output values
echo "\nDynamoDB Tables Created:"
echo "------------------------"
echo "$outputs" | jq -r '.[] | "\(.OutputKey): \(.OutputValue)"'
