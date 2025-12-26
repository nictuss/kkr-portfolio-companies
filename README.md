# KKR Portfolio companies

## Descriptipn:

This is a scraper application that retrieves all portfolio companies from https://kkr.com, and lets you query this data
through a REST API.

## Run with docker compose

### Step 1: start the environment

Start docker-compose that initialized MongoDB first and then the scraping application:

`docker compose up -d`

### Step 2: download the Postman collection:

This application offers a REST API, and a Postman collection is included in this
repository, [HERE](https://documenter.getpostman.com/view/12567506/2sBXVZpusz),
to interact with it.

### Step 3: scrape kkr website:

In the Postman collection you have just downloaded there is a request under

`/scraper/Scrape kkr website`

You need to send it to scrape the website and obtain data.

### Step 4: Query the obtained data:

Now you can query the data you obtained through queries under

`/Query API`

## Development

### Run unit tests:

To run unit tests:

`npm test`

### CI/CD

In this repository there is a CI pipeline that builds the application, runs unit tests and does semantic versioning to every commit pushed to the main branch.
