# DynamoDB Migration Example

This repository demonstrates basic usages of DynamoDB by migrating data structures.

Example for this blog post: https://spin.atomicobject.com/2020/10/20/dynamodb-migrate-data-structures/

# DynamoDB Schema

  + **Partition Key:** PK
  + **Sort Key:** SK

## How to run

* Duplicate `.env.migration-example` as `.env.migration` in the root of the project, then update the environment variables to match your desired config.
* Run `yarn install` to install dependencies.
* Run `yarn seed` to add User records to DynamoDB.
* Run `yarn migrate` to run through all current migrations.
  * Run `yarn up` to run the next individual migration
* Run `yarn rollback` to undo last batch of migrations
  * Run `yarn down` to undo the last migration.
