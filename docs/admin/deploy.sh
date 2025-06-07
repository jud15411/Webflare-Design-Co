#!/bin/bash

# Set AWS region
REGION="us-east-2"

# Create S3 bucket for Lambda code
BUCKET_NAME="webflare-admin-lambda-$REGION"

echo "Creating S3 bucket: $BUCKET_NAME"
aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region $REGION \
    --create-bucket-configuration LocationConstraint=$REGION

# Wait for bucket creation
echo "Waiting for bucket creation..."
sleep 5

# Install dependencies and package Lambda code
echo "Installing dependencies and packaging Lambda code..."
cd lambda
cp -r src/* .
npm install --production
zip -r ../lambda-deployment.zip .
cd ..

# Upload Lambda code to S3
echo "Uploading Lambda code to S3..."
aws s3 cp lambda-deployment.zip s3://$BUCKET_NAME/lambda-deployment.zip --endpoint-url https://s3.us-east-2.amazonaws.com

# Print bucket name for CloudFormation
echo "S3 Bucket created: $BUCKET_NAME"
echo "Lambda code uploaded successfully"
echo "You can now use this bucket name in your CloudFormation template"
