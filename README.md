# KKR Portfolio companies

## Descriptipn:

This is a scraper application that retrieves all portfolio companies from https://kkr.com, and lets you query this data
through a REST API.

## Getting started

### Step 1: start MongoDB docker container:

this is for testing purposes only, data persistence and authentication are intentionally omitted:

`docker run --name mongodb -d -p 27017:27017 mongodb/mongodb-community-server:8.0-ubi8`

### Step 2: start the NestJS server:

`npm start`

The server runs on port 3000, if you want to change this run

`PORT=<port-number> npm start`

### Step 3: download Postman collection:

This application offers a REST API, and a Postman collection is included in this
repository, [HERE](https://web.postman.co/workspace/My-Workspace~660e655f-3385-4ea0-8653-838af739954b/collection/12567506-c446bacf-4827-42ff-922b-f92e44524748?action=share&source=copy-link&creator=12567506),
to interact with it.

### Step 4: scrape kkr website:

In the Postman collection you have just downloaded there is a request under

`/scraper/Scrape kkr website`

You need to send it to scrape the website and obtain data.

### Step 5: Query the obtained data:

Now you can query the data you obtained through queries under

`/Query API`

## Development

### Run unit tests:

To run unit tests:

`npm test`
