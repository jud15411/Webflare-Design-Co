# Webflare Design Co Development

This is the main core application for the business. 

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Installation](#local-installation)
- [Deployment](#-deployment)
  - [Staging Environment](#staging-environment)
  - [Production Environment](#production-environment)
- [Project Structure](#-project-structure)
- [Key Contacts](#-key-contacts)
- [Contributing](#-contributing)

---

## 🛠️ Tech Stack

List the primary technologies, frameworks, databases, and major libraries used in this project. This gives anyone looking at the repo a quick technical overview.

- **Frontend:** React, TypeScript, Vite
- **Backend:** NodeJS, Express, Typescript, Restful API, Websockets, Redis
- **Database:** MongoDB Atlas
- **Infrastructure:** Docker

---

## 🚀 Getting Started

This section provides a complete guide on how to get a local development environment up and running.

### Prerequisites

List all the software and tools that a developer needs to have installed *before* they can set up the project. Include specific version numbers if they are important.

- [Node.js](https://nodejs.org/) (v20.x or higher)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### Local Installation

A step-by-step guide to installing dependencies and setting up the project locally.

1.  **Clone the repository:**
   - Ensure you are in a folder called Webflare-Design-Co

    ```bash
    git clone https://github.com/Webflare-Design-Co/platform
    ```

3.  **Install Server dependencies:**
    ```bash
    cd apps/server
    npm install
    ```
4.  **Install Client Portal dependencies:**
    ```bash
    cd apps/portal
    npm install
    ```

5.  **Install Admin Panel dependencies:**
    ```bash
    cd apps/client
    npm install
    ```

6.  **Set up environment variables:**
    - Copy the example environment file.
      ```bash
      cd apps/server
      cp .env.development.example .env.development
      cp .env.production.example .env.production
      ```

      ```bash
      cd apps/client
      cp .env.development.example .env.development
      cp .env.production.example .env.production
      ```
    - Open the newly created `.env` files and fill in the required secret keys and configuration values. Ask `Judson Wells (CEO)` for the necessary credentials.

7.  **Start the development server:**
    ```bash
    docker compose build
      - let that run as it will take a minute on the first build
    docker compose up
    ```

Your application should now be running at `http://localhost:3000`.

---

## ☁️ Deployment

This section is where you will detail the process for deploying the application.

### Staging Environment

The staging environment is used for testing new features before they go live.

- **URL:** `https://staging.yourproject.com`
- **Deployment Trigger:** Merging a feature branch into the `develop` branch automatically triggers a deployment via GitHub Actions.
- **Manual Deployment:** To deploy manually, run the following command:
  ```bash
  [e.g., vercel deploy --prebuilt]
