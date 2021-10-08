const { TABLE_NAME } = require("../scripts/dynamodb");

const up = async (item, DB) => {
  if (item.PK.startsWith('User')) {
    await DB.put({
      TableName: TABLE_NAME,
      Item: {
        ...item,
        SK: 'meta_updated'
      },
    }).promise();
    const { PK, SK } = item;
    await DB.delete({
      TableName: TABLE_NAME,
      Key: {
        PK,
        SK
      },
    }).promise();
  }
}

const down = async (item, DB) => {
  if (item.PK.startsWith('User')) {
    await DB.put({
      TableName: TABLE_NAME,
      Item: {
        ...item,
        SK: 'meta'
      },
    }).promise()
    const { PK, SK } = item;
    await DB.delete({
      TableName: TABLE_NAME,
      Key: {
        PK,
        SK
      },
    }).promise();
  }
}

module.exports = {
  up,
  down,
  sequence: 3,
};