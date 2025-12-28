# KKR Portfolio companies

## Description:

This is a scraper application that retrieves all portfolio companies from https://kkr.com and lets you query this data
through a REST API. You can start this project with docker compose locally or test a deployed instance
through [THIS](https://www.postman.com/nicolopalmiero/workspace/kkr-workspace/collection/12567506-c446bacf-4827-42ff-922b-f92e44524748?action=share&creator=12567506&active-environment=12567506-6c92905e-3ee8-4423-af4d-6a87d1596f36)
Postman collection.

## Run with docker compose

### Step 1: start the environment

Start docker-compose that initialized MongoDB first and then the scraping application:

`docker compose up -d`

### Step 2: Use Local environment:

In the Postman collection you have just downloaded, you need to set "Local" environment from the tab to the upper right

## Test the deployed application:

To test the deployed application, you need to select the "AWS" Postman environment

## Interaction (API):

### Step 1: scrape kkr website:

The first request you should do in Postman is under

`/Scraper API/Scrape kkr website`

You need to send it to scrape the website and gather data.

### Step 2: Query the obtained data:

Now you can query the data you collected through queries under

`/Query API`

You can only perform GET requests and you can filter out results using query string parameters. Mostly al fields (except for "sequenceNumber" and "lastUpdate") of the companies are searchable through exact match or regex, like it is shown in the Postman collection.

## Development

### Run unit tests:

To run unit tests:

`npm test`

### CI/CD

In this repository there is a CI/CD pipeline that builds the application, runs unit tests, does semantic versioning and deploys the application whenever a push is done to the main branch.
