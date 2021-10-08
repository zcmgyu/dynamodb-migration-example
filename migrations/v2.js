const { TABLE_NAME } = require("../scripts/dynamodb");

const up = async (item, DB) => {
  if (item.PK.startsWith('Car')) {
    await DB.put({
      TableName: TABLE_NAME,
      Item: {
        ...item,
        Name: item.Name + ' updated',
      },
    }).promise()
  }
}

const down = async (item, DB) => {
  if (item.PK.startsWith('Car')) {
    await DB.put({
      TableName: TABLE_NAME,
      Item: {
        ...item,
        Name: item.Name.slice(0, -' updated'.length),
      },
    }).promise()
  }
}

module.exports = {
  up,
  down,
  sequence: 2,
};