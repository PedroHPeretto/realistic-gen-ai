# Database consultor assistant

## Index

* [About](#about)
* [Tech Stack](#tech-stack)
* [How to use](#how-to-use)
  * [Prerequisites](#prerequisites)
  * [Configuration](#configuration)
  * [Commands](#commands)

## About

> This project creates a database consultor assistant that simulates a real consultor using Gen AI Agents and a self-made MCP Server. This project was built to learn and practice creating Gen AI Agents and MCP Servers while using professional infraestructure such as AWS Bedrock and AWS Bedrock Agent Core. There are just one useful API endpoint that calls the Agent, since the LLMs handle all the complexity through the context of the request that the user made. The main idea is making the Agent consult the database via MCP Server Tools, and use the pre-built queries to find the piece of data requested by the user.

## Tech Stack

* [Node.js](https://nodejs.org)
* [Express](https://expressjs.com)
* [SQLite](https://sqlite.org/)
* [AWS Bedrock](https://aws.amazon.com/bedrock/)
* [LangGraph](https://www.langchain.com/langgraph)
* [MCP SDK](https://modelcontextprotocol.io/docs/sdk)

## How to use

> To test the project, first you have to configure the envionment, as described below:

### Prerequisites

> To use the API, it is necessary to have installed Node.js on your PC. Link on [Tech Stack](#tech-stack)

### Configuration

Clone the repository:

```bash
git clone https://github.com/PedroHPeretto/database-consultor-agent.git

cd (folder name)

npm install
```

Configure the environment variables:

```bash
cp .env.example .env
```

### Commands

Now that you have everything configured, start the API:

```bash
npx ts-node src/main.ts
```

> That`s it! Feel free to fork, add a star or suggest improvements. Thank you!