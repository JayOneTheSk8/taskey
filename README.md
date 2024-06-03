# Taskey

The "key" to all of your task management dreams. Users can create accounts and manage their tasks. Users can also clearly see which tasks to prioritise as past due tasks will appear on top. Users can also complete tasks, making management easier.

The project is build using a [Ruby on Rails](https://rubyonrails.org/) project connected to a [PostgresQL](https://www.postgresql.org/) database to serve a [GraphQL](https://graphql.org/) API. The UI is built in [TypeScript](https://www.typescriptlang.org/) with [React](https://react.dev/) using [Apollo](https://www.apollographql.com/docs/) to connect to the Rails' GraphQL server. 

Authentication is handled via Rails' [Session Store](https://guides.rubyonrails.org/v4.1/action_controller_overview.html#accessing-the-session). A `session_token` is added to the user and the session keeps this in memory. 

Table of Contents
===================
- [Running Full Application](#running-full-application-dev)

- [Installation](#installation)
  - [Backend](#backend)
  - [Frontend](#frontend)

- [Notes/Thoughts](#notesthoughts)

Running Full Application (Dev)
===================

To run the entire application (frontend/backend), there is a helpful foreman script.

```sh
bin/dev
```

The server will be loaded at http://127.0.0.1:3000/

Installation
===================

## Backend

Requires [ruby-3.2.2](https://github.com/rbenv/rbenv?tab=readme-ov-file#installation) and [postgresql](https://www.postgresql.org/download/).

#### Create Postgres User/Password
```sh
# Create Postgres User/Password
sudo -u postgres createuser -s <TASKEY_DATABASE_USER> -P

# Add to environment variables
echo $'export TASKEY_DATABASE_USER="<TASKEY_DATABASE_USER>"\nexport TASKEY_DATABASE_PASSWORD="<TASKEY_DATABASE_PASSWORD>"\n' >> ~/.bashrc

# Use TASKEY_DATABASE_USER/PASSWORD
source ~/.bashrc
```

#### Install Gems and Setup Database
```sh
bundle install
bin/rails db:create
bin/rails db:migrate
```

### Seed Database

```sh
bin/rails db:seed
```

### Run Rails Server Only

```sh
bin/rails s
```

### Lint (via Rubocop)
```sh
bin/rubocop
```

### Run Test Specs
```sh
bin/rspec
```

### Dump GraphQL Schema
```sh
# schema.graphql
bin/rake graphql:schema:idl

# graphql.json
bin/rake graphql:schema:json

# Dump both
rails graphql:schema:dump
```

## Frontend

Requires [Node v16.14.2](https://nodejs.org/en/download/package-manager) and [Yarn](https://yarnpkg.com/getting-started/install).

Built using [ESBuild](https://esbuild.github.io/).

#### Install packages
```sh
yarn
```

#### Build Assets
The assets can either be build using the script or using foreman. When run via foreman, the Rails server is also run and the entrypoint at `app/assets/javascript/entryopints/` is watched for changes. There is a helpful file to load everything with `bin/dev`.

via NPM Script (Build assets alone)
```sh
yarn build
```

via Foreman
```sh
bin/dev
```

Notes/Thoughts
===================

### Task Display Order
I think deciding on the order of tasks was interesting to consider. I wanted to
fetch them all in one query but quickly realised that the order of each list
(pending/completed) would be different. The completed task list should be ordered
by the latest task created while the pending task list should be ordered by the
`due_date` to prioritise past due tasks. It will at most be two calls though so I
felt the trade off worth it.

In a different world, we could have a priority column to keep the tasks in the order
the user wanted. We could also replace the `completed` column with a `completed_at`
datetime columna and sort by that for the completed list.

### Length Limits
Should I think about string limits? I'm not sure, but this should be addressed by
clarifying future scaling product requirements.

### Linting
Rubocop is a gift in cleanliness and a curse in speediness. I wanted to add typescript linting via eslint, but it quickly became too complicated and slowed the process down. 

### Auth Refactoring
Initially, I used Rails' [Global ID](https://github.com/rails/globalid) for server authentication, but the issue is that the "session" (in that sense) cannot be cleared. It was simple enough to refactor.

### Default to Session Token Column
The `session_token` was a newly migrated field and was not null, so to be proper, I felt it deserved a default value in the migration. Since there aren't many rows and in real life we would have decided on a plan **before** implementation, I just made it a random string. With the small number of rows, it was unique enough.

### Adding Javascript
Adding Javascript just kind of works in Rails so it feels very black box. Also, since it requires bundling, tracing errors through functions was difficult.

### GraphQL Schema Descriptions
I wanted to add more descriptions in the GraphQL schema but having descriptions like "The user's username" are not helpful and only waste 3 lines of code.

### Rendering Tasks in Frontend
I think there are faster ways of editing the tasks lists in the frontend but I went for funtional first and planned on iterating later. If we really cared, we could use a better data structure to avoid O(n) time complexity.
