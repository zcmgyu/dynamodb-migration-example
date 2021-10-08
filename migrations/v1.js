const { TABLE_NAME } = require("../scripts/dynamodb");

const up = async (item, DB) => {
  if (item.PK.startsWith('User')) {
    await DB.put({
      TableName: TABLE_NAME,
      Item: {
        ...item,
        status: 'Active',
      },
    }).promise()
  }
}

const down = async (item, DB) => {
  if (item.PK.startsWith('User')) {
    const { status, ...rest } = item;

    await DB.put({
      TableName: TABLE_NAME,
      Item: rest,
    }).promise()
  }
}

module.exports = {
  up,
  down,
  sequence: 1,
};
