# Webflare Admin Panel (Rebuild)

This directory contains the new Webflare Admin Panel, built from scratch.

## Purpose

To provide an administrative interface for managing:
- Contracts
- Clients
- Projects
- Invoices
- Team Members

## Tech Stack (Planned)

- **Frontend:** HTML, CSS, JavaScript
- **Authentication:** Amazon Cognito
- **API:** Amazon API Gateway + AWS Lambda (Node.js or Python)
- **Database:** Amazon DynamoDB
- **Storage (for files like contracts):** Amazon S3

## Setup (High-Level)

1.  **AWS Account:** Ensure you have an AWS account.
2.  **Cognito User Pool & Identity Pool:** Set up for user authentication.
3.  **DynamoDB Tables:** Create tables for each data entity (contracts, clients, etc.).
4.  **Lambda Functions:** Develop backend logic for CRUD operations.
5.  **API Gateway:** Expose Lambda functions as RESTful APIs.
6.  **S3 Bucket:** Configure for file storage if needed.
7.  **IAM Roles & Policies:** Ensure appropriate permissions for services to interact.
8.  **Frontend Configuration:** Update `js/auth.js` and `js/api.js` with your AWS resource details (e.g., Cognito Pool ID, API Gateway endpoint).

## Development

-   `index.html`: Main entry point (initially login, will expand to dashboard).
-   `css/styles.css`: Global stylesheets.
-   `js/`: Contains JavaScript modules:
    -   `auth.js`: Handles Cognito authentication.
    -   `api.js`: Manages API calls to the backend.
    -   `ui.js`: DOM manipulation and UI updates.
    -   `main.js`: Core application logic.

Further details will be added as development progresses.
