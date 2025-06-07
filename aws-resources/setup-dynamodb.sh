#!/bin/bash

# AWS CLI configuration
REGION="us-east-2"

# Create DynamoDB tables
TABLES=(
    "Contracts"
    "Clients"
    "Projects"
    "Invoices"
    "Team"
)

for TABLE in "${TABLES[@]}"; do
    echo "Creating ${TABLE} table..."
    aws dynamodb create-table \
        --table-name "webflare-${TABLE}" \
        --attribute-definitions \
            AttributeName=id,AttributeType=S \
        --key-schema \
            AttributeName=id,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region $REGION

done

echo "Waiting for tables to be created..."
for TABLE in "${TABLES[@]}"; do
    aws dynamodb wait table-exists \
        --table-name "webflare-${TABLE}" \
        --region $REGION
    echo "Table ${TABLE} created successfully"
done
