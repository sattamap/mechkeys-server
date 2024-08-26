# Mechanical Keyboard Shop - Backend

## Overview
This repository contains the backend server for the Mechanical Keyboard Shop, an e-commerce platform dedicated to mechanical keyboards. The backend is built using Node.js, Express, and MongoDB.

## Live Server
You can access the live server here: [Mechanical Keyboard Shop Backend](https://mechkeys-server.vercel.app/)

## GitHub Repository
The code for the backend server is available in this GitHub repository: [MechKeys Server](https://github.com/sattamap/mechkeys-server.git)

## Technology Stack
- **Node.js**: JavaScript runtime environment.
- **Express**: Web application framework for Node.js.
- **MongoDB**: NoSQL database for storing data.
- **dotenv**: Module for loading environment variables.
- **cors**: Middleware for enabling CORS (Cross-Origin Resource Sharing).

## Packages Used
```json
{
  "name": "mechkeys-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongodb": "^6.8.0"
  }
}

## Setup Instructions
### Clone the Repository

```bash
git clone: https://github.com/sattamap/mechkeys-server.git
cd room-booking-system-server
```
### Install Dependencies

```bash
npm install
```
### Environment Variables

### Set up environment variables:
    Copy the `.env.example` file to `.env` and fill in your own values:
    ```bash
    cp .env.example .env
    ```

    Edit the `.env` file with your own values:
    ```env
    NODE_ENV=development
    PORT=5000
    ```
### Start the Server

#### Development Mode:

```bash
npm run start:dev
```
### Production Mode:

```bash
npm run build
npm run start:prod
```
**Access the application:**
   - **Local Server:** Open your browser and go to `http://localhost:5000/`
   - **Vercel Server:** Open your browser and go to [Express Server App on Vercel](https://mechkeys-server.vercel.app/)


This `README.md` provides a clear guide for setting up and running your backend server, including live and GitHub links, installation instructions, and environment setup.