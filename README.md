<h1 align="center">

<br>
Meetapp - Backend
</h1>


This app features all the latest tools and practices in web development!

- **Express** — Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- **Postgres** — A powerful, open source object-relational database system that uses and extends the SQL language
- **Redis** — Redis is an open source (BSD licensed), in-memory data structure store, used as a database, cache and message broker
- **Docker** — Docker is a tool designed to make it easier to create, deploy, and run applications by using containers.

## Getting started

1. Clone this repo using git clone `https://github.com/fzuffo/MeetApp-backend`
2. Follow instructions bellow

## Backend

1. Rename the file `.env.example` to `.env` and add the your database config
2. Run `yarn install` to install dependencies
3. Run `yarn sequelize db:migrations` to statup migrations
4. Run `yarn server` to start the server
5. Run `yarn queue` to start listen job queue

## Frontend
`https://github.com/fzuffo/MeetApp-frontend`

## Mobile
`https://github.com/fzuffo/MeetApp-mobile`
