# Taskey

The "key" to all of your task management dreams.

Installation
===================

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
```
bundle install
bin/rails db:create
bin/rails db:migrate
```

### Run Server

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

