
# Bloomen developer portal app

## Installation

1. Go to project folder and install dependencies:
 ```sh
 npm install
 ```

2. Launch development server, and open `localhost:3000` in your browser:
 ```sh
 cp .env.example .env.development
 -- fill .env.development with development configuration. 
 npm start
 ```

# Main tasks

Task automation is based on [NPM scripts](https://docs.npmjs.com/misc/scripts).

Task                            | Description
--------------------------------|--------------------------------------------------------------------------------------
`npm start`                     | Run development server on `http://localhost:3000/`


   
----------

## Database

The example codebase uses [Typeorm](http://typeorm.io/) with a mongodb database.

----------

## NPM scripts

- `npm start` - Start application
- `npm run build` - Build application

----------

## API Specification

This application adheres to the api specifications set by the [Thinkster](https://github.com/gothinkster) team. This helps mix and match any backend with any other frontend without conflicts.

> [Full API Spec](https://github.com/gothinkster/realworld/tree/master/api)

More information regarding the project can be found here https://github.com/gothinkster/realworld

----------

## Start application

- `npm start`
- Test api with `http://localhost:3000/api/docs` in your favourite browser

----------

# Authentication
 
This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token. Please check the following sources to learn more about JWT.
