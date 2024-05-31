# Taskey

The "key" to all of your task management dreams. Users can create accounts and manage their tasks. Users can also clearly see which tasks to prioritise as past due tasks will appear on top. Users can also complete tasks, making management easier.

The project is build using a [Ruby on Rails](https://rubyonrails.org/) project connected to a [PostgresQL](https://www.postgresql.org/) database to serve a [GraphQL](https://graphql.org/) API. The UI is built in [TypeScript](https://www.typescriptlang.org/) with [React](https://react.dev/) using [Apollo](https://www.apollographql.com/docs/) to connect to the Rails' GraphQL server. 

Authentication is handled via Rails' [Session Store](https://guides.rubyonrails.org/v4.1/action_controller_overview.html#accessing-the-session). A `session_token` is added to the user and the session keeps this in memory. 

Running Full Application (Dev)
===================

To run the entire application (frontend/backend), there is a helpful foreman script.

```sh
bin/dev
```


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
The assets can either be build using the script or using foreman. When run via foreman, the Rails server is also run and the entrypoint at `app/assets/javascript/entryopints/` is watched for changes. There is a helpful file to load everything in `bin/dev`.

via NPM Script (Build assets alone)
```sh
yarn build
```

via Foreman
```sh
bin/dev
```
