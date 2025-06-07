#!/bin/bash

# Create Contracts table
aws dynamodb create-table \
    --table-name WebflareContracts \
    --attribute-definitions \
        AttributeName=ContractId,AttributeType=S \
        AttributeName=ClientId,AttributeType=S \
        AttributeName=Status,AttributeType=S \
    --key-schema \
        AttributeName=ContractId,KeyType=HASH \
    --global-secondary-indexes \
        '[{"IndexName":"ClientIdIndex","KeySchema":[{"AttributeName":"ClientId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}},
         {"IndexName":"StatusIndex","KeySchema":[{"AttributeName":"Status","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
    --billing-mode PAY_PER_REQUEST

echo "Created Contracts table"

# Create Invoices table
aws dynamodb create-table \
    --table-name WebflareInvoices \
    --attribute-definitions \
        AttributeName=InvoiceId,AttributeType=S \
        AttributeName=ClientId,AttributeType=S \
        AttributeName=Status,AttributeType=S \
        AttributeName=DueDate,AttributeType=S \
    --key-schema \
        AttributeName=InvoiceId,KeyType=HASH \
    --global-secondary-indexes \
        '[{"IndexName":"ClientIdIndex","KeySchema":[{"AttributeName":"ClientId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}},
         {"IndexName":"StatusIndex","KeySchema":[{"AttributeName":"Status","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}},
         {"IndexName":"DueDateIndex","KeySchema":[{"AttributeName":"DueDate","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
    --billing-mode PAY_PER_REQUEST

echo "Created Invoices table"

# Create Clients table
aws dynamodb create-table \
    --table-name WebflareClients \
    --attribute-definitions \
        AttributeName=ClientId,AttributeType=S \
        AttributeName=Name,AttributeType=S \
        AttributeName=Status,AttributeType=S \
    --key-schema \
        AttributeName=ClientId,KeyType=HASH \
    --global-secondary-indexes \
        '[{"IndexName":"NameIndex","KeySchema":[{"AttributeName":"Name","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}},
         {"IndexName":"StatusIndex","KeySchema":[{"AttributeName":"Status","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
    --billing-mode PAY_PER_REQUEST

echo "Created Clients table"

# Create Projects table
aws dynamodb create-table \
    --table-name WebflareProjects \
    --attribute-definitions \
        AttributeName=ProjectId,AttributeType=S \
        AttributeName=ContractId,AttributeType=S \
        AttributeName=Status,AttributeType=S \
    --key-schema \
        AttributeName=ProjectId,KeyType=HASH \
    --global-secondary-indexes \
        '[{"IndexName":"ContractIdIndex","KeySchema":[{"AttributeName":"ContractId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}},
         {"IndexName":"StatusIndex","KeySchema":[{"AttributeName":"Status","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
    --billing-mode PAY_PER_REQUEST

echo "Created Projects table"

# Create Team Members table
aws dynamodb create-table \
    --table-name WebflareTeamMembers \
    --attribute-definitions \
        AttributeName=TeamMemberId,AttributeType=S \
        AttributeName=Role,AttributeType=S \
        AttributeName=Status,AttributeType=S \
    --key-schema \
        AttributeName=TeamMemberId,KeyType=HASH \
    --global-secondary-indexes \
        '[{"IndexName":"RoleIndex","KeySchema":[{"AttributeName":"Role","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}},
         {"IndexName":"StatusIndex","KeySchema":[{"AttributeName":"Status","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
    --billing-mode PAY_PER_REQUEST

echo "Created Team Members table"

echo "All tables created successfully"
