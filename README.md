# KKR Portfolio companies

## Description:

This is a scraper application that retrieves all portfolio companies from https://kkr.com, and lets you query this data
through a REST API.

## Run with docker compose

### Step 1: start the environment

Start docker-compose that initialized MongoDB first and then the scraping application:

`docker compose up -d`

### Step 2: download the Postman collection:

This application offers a REST API, and a Postman collection is included in this
repository, [HERE](https://www.postman.com/nicolopalmiero/workspace/kkr-workspace/collection/12567506-c446bacf-4827-42ff-922b-f92e44524748?action=share&creator=12567506&active-environment=12567506-6c92905e-3ee8-4423-af4d-6a87d1596f36),
to interact with it.

### Step 3: Use Local environment:

In the Postman collection you have just downloaded you need to set "Local" environment from the tab to the up right

### Step 3: scrape kkr website:

The first request you should do in Postman is under

`/scraper/Scrape kkr website`

You need to send it to scrape the website and gather data.

### Step 4: Query the obtained data:

Now you can query the data you collected through queries under

`/Query API`

## Development

### Run unit tests:

To run unit tests:

`npm test`

### CI/CD

In this repository there is a CI pipeline that builds the application, runs unit tests and does semantic versioning to every commit pushed to the main branch.
