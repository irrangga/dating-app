## Description

Dating app using [Nest](https://github.com/nestjs/nest).

## Code structure

```bash
src
|─ auth
|─ common
|─ profiles
|   |─ constants
|   |─ dto
|   |─ entities
|   |─ controller.ts
|   |─ module.ts
|   └─ service.ts
|─ app.module.ts
└─ main.ts
```

## Installation

```bash
$ yarn install

# make environment variable
rename file .env.sample -> .env

# setup database
setup database and update .env value based on the setup 
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
```

## Test

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```

