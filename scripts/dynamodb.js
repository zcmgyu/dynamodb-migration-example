require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
});

const { DocumentClient } = AWS.DynamoDB;
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

module.exports = {
  DocumentClient,
  TABLE_NAME
}