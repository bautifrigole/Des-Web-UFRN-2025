# Calculate Costs

## Description
A web application designed to help individuals manage their personal finances. Users can track expenses, incomes and investments in real-time. The app also integrates with external stock APIs, allowing users to monitor stock performance and add investments to their dashboard.

## Prerequisites
* NodeJS installed
* NPM installed
* Docker Compose installed

## Installation

Start the PostgreSQL database using Docker Compose:
```bash
docker-compose up --build
```

Open a terminal console in the project directory and use the command `npm install` to install all project dependencies.

Create a .env file in the project folder with the following database details:

```
PGUSER=<username>
PGHOST=<host>
PGPASSWORD=<password>
PGDATABASE=<db_name>
PGPORT=<port>

jwtSecret=<server_password>
```

## Run app
```npm run dev```
